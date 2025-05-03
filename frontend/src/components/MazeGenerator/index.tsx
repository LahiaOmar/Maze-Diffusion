import { ChangeEvent, useEffect, useState } from 'react';
import { generateMaze, solveMaze, TMaze, TPoint } from './Utils';
import cx from 'classnames';
import html2canvas from 'html2canvas-pro';
import { createRoot } from 'react-dom/client';

interface IMazeGenerated {
  mazes: TMaze[];
  starts: TPoint[];
  ends: TPoint[];
  size: number;
  nbMazes: number;
  solutions: TPoint[][];
}

type TMazeInfo = Pick<IMazeGenerated, 'mazes' | 'solutions' | 'ends' | 'starts'> 

const MazeGenerator = () => {
  const [generatedMaze, setGeneratedMaze] = useState<IMazeGenerated>({
    mazes: [],
    starts: [],
    ends: [],
    size: 10,
    nbMazes: 2,
    solutions: [],
  });
  const { mazes, size, solutions, nbMazes, starts, ends } = generatedMaze;

  const setMazeSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGeneratedMaze((last) => ({
      ...last,
      size: +e.target.value,
    }));
  };

  const setNumberOfMazesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGeneratedMaze((last) => ({
      ...last,
      nbMazes: +e.target.value,
    }));
  };

  const generateSingleMaze = () => {
    const start = { x: 0, y: 0 };

    const maze = generateMaze(size, size, start);

    const filterMaze = maze
      .reduce((prev, row, i) => {
        const filterRow = row.reduce<TPoint[]>((p, cell, j) => {
          if (cell === 1) {
            p.push({ x: i, y: j });
          }
          return p;
        }, []);

        const _prev = prev.concat(filterRow);
        return _prev;
      }, [] as TPoint[])
      .filter((p) => p.x !== start.x && p.y !== start.y);

    const randomEnd = filterMaze[Math.floor(Math.random() * filterMaze.length)];
    const randomStart =
      filterMaze[Math.floor(Math.random() * filterMaze.length)];
    const solution = solveMaze(maze, randomStart, randomEnd);

    return {
      maze,
      solution,
      start: randomStart,
      end: randomEnd,
    };
  };

  const generate = () => {
    const _newState: TMazeInfo = { mazes: [], solutions: [], starts: [], ends: []  }

    for (let i = 0; i < nbMazes; i++) {
      const { maze, solution, start, end } = generateSingleMaze();

      _newState['mazes'].push(maze)
      _newState.solutions.push(solution)
      _newState.starts.push(start)
      _newState.ends.push(end)

    }

    if(nbMazes){
      setGeneratedMaze((last) => ({
        ...last,
        mazes: _newState.mazes,
        solutions: _newState.solutions,
        starts: _newState.starts,
        ends: _newState.ends
      }))
    }
  };

  const renderMaze = (
    maze: TMaze,
    solution: TPoint[],
    start: TPoint,
    end: TPoint,
    options: {
      showSolution: boolean
    }
  ) => {
    const { showSolution = true } = options
    return (
      <div id="" className="flex flex-col space-y-2">
        <div className="flex border-2">
          {maze.map((mazeRow, i) => {
            const row = mazeRow.map((mazeCell, j) => {
              if (i === start.x && j === start.y) {
                return (
                  <div
                    key={`${i},${j}`}
                    className={cx('w-8 h-8 text-center bg-blue-400')}
                  ></div>
                );
              }

              if (i === end.x && j === end.y) {
                return (
                  <div
                    key={`${i},${j}`}
                    className="w-8 h-8 text-center bg-red-400"
                  ></div>
                );
              }

              if (showSolution && solution.find((p) => p.x === i && p.y === j)) {
                return (
                  <div
                    key={`${i},${j}`}
                    className="w-8 h-8 text-center bg-green-300"
                  ></div>
                );
              }

              if (mazeCell === 1) {
                return (
                  <div
                    key={`${i},${j}`}
                    className="w-8 h-8 text-center bg-white"
                  ></div>
                );
              }

              return (
                <div
                  key={`${i},${j}`}
                  className={cx(
                    'w-8 h-8 text-center border-black bg-black',
                    {
                      'border-t':
                        j === 0 || (j - 1 >= 0 && maze[i][j - 1] === 1),
                    },
                    {
                      'border-r': i + 1 < maze.length && maze[i + 1][j] === 1,
                    },
                    {
                      'border-l': !!(i - 1 >= 0 && maze[i - 1][j] == 1),
                    },
                    {
                      'border-b': j + 1 < maze[i].length && maze[i][j + 1] == 1,
                    }
                  )}
                ></div>
              );
            });

            return (
              <div key={i} className="flex flex-col">
                {row}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const mazePreview = () => {
    const randomMazeNumber = Math.floor(Math.random() * mazes.length);

    const withoutSolution =  renderMaze(
      mazes[randomMazeNumber],
      solutions[randomMazeNumber],
      starts[randomMazeNumber],
      ends[randomMazeNumber],
      {
        showSolution: false,
      }
    );

    const withSolution = renderMaze(
      mazes[randomMazeNumber],
      solutions[randomMazeNumber],
      starts[randomMazeNumber],
      ends[randomMazeNumber],
      {
        showSolution: true,
      }
    )

    return [
      withoutSolution, withSolution 
    ]
  };

  const download = async () => {
    const mazeIDContainer = 'maze-dump-container'

    const downloadSingleImage = async (
      container: HTMLElement, 
      mazeData: { maze: TMaze, solution: TPoint[], start: TPoint, end: TPoint, index: number},
      showSolution: boolean
    ) => {
      const { maze, solution, start, end, index } = mazeData

      const root = createRoot(container);
      root.render(renderMaze(maze, solution, start, end, { showSolution }));

      // Wait a bit for the rendering to complete
      await new Promise((res) => setTimeout(res, 100)); // Optional: adjust timing if needed
      const mazeEl = container.querySelector('div'); // or give a class to the inner maze div
      
      if (!mazeEl) return;

      const canvas = await html2canvas(mazeEl, { scale: 2 });
      const link = document.createElement('a');
      link.download = showSolution ? `maze_${index}_solution.png` : `maze_${index}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      root.unmount(); 
    }

    for(let i = 0; i < nbMazes; i++){
      const container = document.getElementById(mazeIDContainer)
      if (!container) return;
      
      await downloadSingleImage(
        container,
        { maze: mazes[i], solution: solutions[i], start: starts[i], end: ends[i], index: i },
        false 
      )

      await downloadSingleImage(
        container,
        { maze: mazes[i], solution: solutions[i], start: starts[i], end: ends[i], index: i },
        false 
      )
    }

    
  };

  useEffect(() => {
    generate();
  }, [size, nbMazes]);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-center">Preview Of A Random Maze</h3>
      <div className='flex flex-row space-x-2'>
        {mazes.length && mazePreview()}
      </div>
      <div className="flex flex-col space-y-4 justify-center items-center">
        <div className='w-sm'>
          <label
            htmlFor="maze-size"
            className="block mb-2 text-sm font-medium text-black"
          >
            Maze Size
          </label>
          <input
            type="number"
            id="maze-size"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={setMazeSizeChange}
            placeholder="10"
            value={size}
          />
        </div>
        <div className='w-sm'>
          <label
            htmlFor="nb-mazes"
            className="block mb-2 text-sm font-medium text-black"
          >
            Number of mazes
          </label>
          <input
            type="number"
            id="nb-mazes"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={setNumberOfMazesChange}
            placeholder="100"
            value={nbMazes}
          />
        </div>
        <div className='flex flex-col'>
          <button
            className="w-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={generate}
          >
            generate
          </button>
          <button
            className="w-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={download}
          >
            DownLoad
          </button>
        </div>
      </div>
      <div
        id="maze-dump-container"
        style={{
          position: 'absolute',
          top: 0,
          left: '-9999px',
        }}
      />
    </div>
  );
};

export default MazeGenerator;
