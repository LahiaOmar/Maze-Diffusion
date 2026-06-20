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
}

const INIT_STATE: IMazeSolution = {
  maze: null,
  solution: null,
  start: null,
  end: null,
  size: 28,
  loadingResponse: false,
  error: false,
};

const API_URL = import.meta.env.VITE_API_URL || 'solve';

const MazeSolution = () => {
  const [state, setState] = useState<IMazeSolution>(INIT_STATE);
  const { maze, start, end, solution } = state;

  const lastPosition = useRef('s');

  const resetState = () => {
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
    setState((last) => ({ ...last, solution: null, loadingResponse: true }));

    let error = false
    if (state.maze && state.end && state.start) {
      try {
        // call server
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
        });

        const data = await response.json();
        if (data.solution) {
          const _solution = data.solution as Array<Array<number>>;
          const solutionPath: TPoint[] = [];

          _solution.forEach((path) => {
            solutionPath.push({ x: path[0], y: path[1] });
          });

          setState((last) => ({
            ...last,
            solution: solutionPath,
            error: false,
            loadingResponse: false,
          }));

          return
        }
      } catch (ex) {
        console.error(ex);
        error = true
      }
    }

    setState((last) => ({ ...last, loadingResponse: false, error }));
  };

  const setLastPosition = () => {
    lastPosition.current = lastPosition.current === 'e' ? 's' : 'e';
  };

  const handleOnPosition = (x: number, y: number) => {
    const point: TPoint = { x, y };

    if (lastPosition.current === 's') {
      setState((last) => ({
        ...last,
        start: point,
        solution: null,
      }));
    }

    if (lastPosition.current === 'e') {
      setState((last) => ({
        ...last,
        end: point,
        solution: null,
      }));
    }

    setLastPosition();
  };

  useEffect(() => {
    generateMaze();
  }, []);

  const shouldRenderMaze = !!(maze && start && end);
  const haveSolution = !!solution;

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
              shouldRenderMaze && haveSolution
                ? renderMaze(maze, solution, start, end, {
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
