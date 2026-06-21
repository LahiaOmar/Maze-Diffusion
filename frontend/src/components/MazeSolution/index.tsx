import { useEffect, useRef, useState } from 'react';
import {
  generateDumyMaze,
  generateSingleMaze,
  renderMaze,
  TMaze,
  TPoint,
} from '../MazeGenerator/Utils';
import cx from 'classnames';

interface IMazeSolution {
  maze: TMaze | null;
  solution: TPoint[] | null;
  start: TPoint | null;
  end: TPoint | null;
  size: number;
  loadingResponse: boolean;
  error: boolean;
  denoisingStep: number | null;
  denoisingTotal: number | null;
}

const INIT_STATE: IMazeSolution = {
  maze: null,
  solution: null,
  start: null,
  end: null,
  size: 28,
  loadingResponse: false,
  error: false,
  denoisingStep: null,
  denoisingTotal: null,
};

const API_URL = import.meta.env.VITE_API_URL || 'solve/stream';

const parseSolutionCoords = (coords: Array<Array<number>>): TPoint[] =>
  coords.map((path) => ({ x: path[0], y: path[1] }));

const consumeSolveStream = async (
  response: Response,
  onFrame: (solution: TPoint[], step: number, total: number) => void,
  signal?: AbortSignal
) => {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    if (signal?.aborted) {
      await reader.cancel();
      return false;
    }

    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const dataLine = event.split('\n').find((line) => line.startsWith('data: '));
      if (!dataLine) continue;

      const payload = JSON.parse(dataLine.slice(6)) as {
        done?: boolean;
        step?: number;
        total?: number;
        solution?: Array<Array<number>>;
      };

      if (payload.done) {
        return true;
      }

      if (payload.solution && payload.step && payload.total) {
        onFrame(
          parseSolutionCoords(payload.solution),
          payload.step,
          payload.total
        );
      }
    }
  }

  return false;
};

const MazeSolution = () => {
  const [state, setState] = useState<IMazeSolution>(INIT_STATE);
  const { maze, start, end, solution } = state;

  const lastPosition = useRef('s');
  const solveAbortRef = useRef<AbortController | null>(null);

  const abortSolve = () => {
    solveAbortRef.current?.abort();
    solveAbortRef.current = null;
  };

  const resetState = () => {
    abortSolve();
    setState(INIT_STATE);
  };

  const generateMaze = () => {
    resetState();
    const {
      maze,
      start,
      end,
      solution: _solution,
    } = generateSingleMaze(state.size);

    setState((last) => ({
      ...last,
      maze,
      start,
      end,
      trueSolution: _solution,
    }));
  };

  const solveMaze = async () => {
    abortSolve();
    const abortController = new AbortController();
    solveAbortRef.current = abortController;

    setState((last) => ({
      ...last,
      solution: [],
      loadingResponse: true,
      error: false,
      denoisingStep: null,
      denoisingTotal: null,
    }));

    let error = false;
    if (state.maze && state.end && state.start) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({
            maze: state.maze,
            startAndEnd: state.maze.map((row, ii) => {
              return row.map((_, jj) => {
                if (ii === state.start?.x && jj === state.start.y) {
                  return 1;
                } else if (ii === state.end?.x && jj === state.end.y) {
                  return 1;
                }

                return 0;
              });
            }),
          }),
          headers: {
            'content-type': 'application/json',
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const completed = await consumeSolveStream(
          response,
          (solutionPath, step, total) => {
            setState((last) => ({
              ...last,
              solution: solutionPath,
              denoisingStep: step,
              denoisingTotal: total,
              error: false,
            }));
          },
          abortController.signal
        );

        if (completed && !abortController.signal.aborted) {
          setState((last) => ({
            ...last,
            loadingResponse: false,
            denoisingStep: null,
            denoisingTotal: null,
          }));
          return;
        }

        if (!abortController.signal.aborted) {
          error = true;
        } else {
          return;
        }
      } catch (ex) {
        if (abortController.signal.aborted) {
          return;
        }
        console.error(ex);
        error = true;
      }
    }

    if (!abortController.signal.aborted) {
      setState((last) => ({
        ...last,
        loadingResponse: false,
        denoisingStep: null,
        denoisingTotal: null,
        error,
      }));
    }
  };

  const setLastPosition = () => {
    lastPosition.current = lastPosition.current === 'e' ? 's' : 'e';
  };

  const handleOnPosition = (x: number, y: number) => {
    abortSolve();
    const point: TPoint = { x, y };

    if (lastPosition.current === 's') {
      setState((last) => ({
        ...last,
        start: point,
        solution: null,
        loadingResponse: false,
        denoisingStep: null,
        denoisingTotal: null,
      }));
    }

    if (lastPosition.current === 'e') {
      setState((last) => ({
        ...last,
        end: point,
        solution: null,
        loadingResponse: false,
        denoisingStep: null,
        denoisingTotal: null,
      }));
    }

    setLastPosition();
  };

  useEffect(() => {
    generateMaze();
    return () => abortSolve();
  }, []);

  const shouldRenderMaze = !!(maze && start && end);
  const haveSolution = !!solution && solution.length > 0;
  const showSolutionPanel = shouldRenderMaze && (haveSolution || state.loadingResponse);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-full min-h-0">
      <div className="flex flex-col space-y-4 mt-4 lg:mt-11 shrink-0 order-2 lg:order-1">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Maze Info</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <span className="inline-block w-4 h-4 bg-black mr-2" /> wall
            </li>
            <li>
              <span className="inline-block w-4 h-4 bg-gray-100 border mr-2" />{' '}
              possible path
            </li>
            <li>
              <span className="inline-block w-4 h-4 bg-blue-500 mr-2" /> start
            </li>
            <li>
              <span className="inline-block w-4 h-4 bg-red-400 mr-2" /> end
            </li>
            <li>
              <span className="inline-block w-4 h-4 bg-green-400 mr-2" />{' '}
              solution
            </li>
          </ul>
          <p className="text-sm mt-2">Maze size: 28 × 28</p>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Model Details</h2>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Model:</strong> Conditioned UNet2DModel (Thansk HF 🤗)
            </li>
            <li>
              <strong>Conditioning:</strong> Maze + start_end
            </li>
            <li>
              <strong>Embeddings:</strong> 3
            </li>
            <li>
              <strong>Embedding size:</strong> 784
            </li>
            <li>
              <strong>Sample size:</strong> 28
            </li>
            <li>
              <strong>in_channels:</strong> 4
            </li>
            <li>
              <strong>out_channels:</strong> 1
            </li>
            <li>
              <strong>Scheduler:</strong> DDPMScheduler (Thansk HF 🤗)
            </li>
            <li>
              <strong>Scheduler timesteps: </strong> 500
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">You can 🕹️ 🤩!! </h2>
          <span>
            Click on the path
            <span className="inline-block w-4 h-4 bg-gray-100 border ml-1 mr-2" />
            to change start/end position
          </span>
        </div>
      </div>
      <div className="flex flex-col space-y-4 items-center justify-center flex-1 min-w-0 order-1 lg:order-2">
        <h1 className="text-center text-2xl sm:text-3xl">🌀 Maze-Diffusion</h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full min-w-0">
          <div className="flex justify-center">
            {
              shouldRenderMaze &&
                renderMaze(maze, [], start, end, {
                  showSolution: false,
                  onPositionClick: handleOnPosition,
                })
            }
          </div>
          <div className="flex justify-center">
            {
              showSolutionPanel
                ? renderMaze(maze, solution ?? [], start, end, {
                    showSolution: true,
                  })
                : renderMaze(
                    generateDumyMaze(state.size),
                    [],
                    { x: -1, y: -1 },
                    { x: -1, y: -1 },
                    { showSolution: false }
                  )
            }
          </div>
        </div>
        {/* solve button */}
        <div className="w-full flex flex-wrap justify-center items-center gap-2 sm:gap-3.5">
          <button
            type="button"
            className="text-white cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 sm:px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={generateMaze}
          >
            generate maze
          </button>

          <button
            disabled={state.loadingResponse}
            type="button"
            className={cx(
              'focus:outline-none text-white cursor-pointer bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 sm:px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800',
              {
                'animate-pulse': state.loadingResponse,
              }
            )}
            onClick={solveMaze}
          >
            {state.loadingResponse ? 'solving ... 🪄' : 'solve'}
          </button>
        </div>
        {state.loadingResponse && (
          <p className="max-w-md text-center text-sm sm:text-base text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            {state.denoisingStep && state.denoisingTotal ? (
              <>
                Denoising: {state.denoisingStep} / {state.denoisingTotal}
                <br />
              </>
            ) : null}
            Hang tight — this usually takes ~40s. The model lives on a humble droplet
            with one lonely CPU. It&apos;s doing its best. 🐢💭
          </p>
        )}
        {
          state.error && (
            <span className='text-red-400 font-bold text-center text-sm sm:text-base'>There is some server error 😢, refresh and try again 🫣</span>
          )
        }
      </div>
      {/* maze + solution */}
    </div>
  );
};

export default MazeSolution;
