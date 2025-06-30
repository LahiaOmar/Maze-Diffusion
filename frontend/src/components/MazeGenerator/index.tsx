import { ChangeEvent, useEffect, useState } from 'react';
import { renderMaze, TMaze, TPoint, generateSingleMaze } from './Utils';
import html2canvas from 'html2canvas-pro';
import { createRoot } from 'react-dom/client';

interface IMazeGenerated {
  mazes: TMaze[];
  starts: TPoint[];
  ends: TPoint[];
  size: number;
  nbMazes: number;
  solutions: TPoint[][];
  downloadType: 'json' | 'images';
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
    downloadType: 'json',
  });
  const { mazes, size, solutions, nbMazes, starts, ends, downloadType } = generatedMaze;

  const setMazeSizeChange = (e: ChangeEvent<HTMLInputElement>) => {    
    setGeneratedMaze((last) => ({
      ...last,
      size: +e.target.value,
      // solutions: []
    }));
  };

  const setNumberOfMazesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGeneratedMaze((last) => ({
      ...last,
      nbMazes: +e.target.value,
      // solutions: []
    }));
  };

  const generate = () => {

    if(size <= 4) return

    const _newState: TMazeInfo = { mazes: [], solutions: [], starts: [], ends: []  }

    for (let i = 0; i < nbMazes; i++) {
      const { maze, solution, start, end } = generateSingleMaze(size);

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

  const downloadImages = async () => {
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
        true 
      )
    }
  }
  const downloadJSON = () => {
    if(nbMazes){
      const jsonArray = []
      for (let i = 0 ; i < nbMazes; i++){
        const current: any = {}

        current['maze'] = mazes[i]
        current['solution'] = mazes[i].map((row, ii) => {
          return row.map((_, jj) => {
            if(solutions[i].find(sol => sol.x === ii && sol.y === jj)){
              return 1
            }
            
            return 0
          })
        })

        current['startAndEnd'] = mazes[i].map((row, ii) => {
          return row.map((_, jj) => {
            if(ii === starts[i].x && jj === starts[i].y){
              return 1
            }
            else if(ii === ends[i].x && jj === ends[i].y){
              return 1
            }

            return 0
          })
        })

        jsonArray.push(current)
      }

      const jsonStr = JSON.stringify(jsonArray, null, 2)

      const blob = new Blob([jsonStr], { type: "application/json"})
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = 'mazes.json'
      a.click()

      URL.revokeObjectURL(url)
    }
  }

  const download = async () => {
    
    switch(downloadType){
      case 'images': {
        return downloadImages()
      }
      case 'json': {
        return downloadJSON()
      }
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
            type="text"
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
            type="text"
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
            onClick={download}
          >
            DownLoad
          </button>
        </div>
        <div className=''>
          <select value={downloadType} onChange={(e) => {
            if(e.target.value){
              setGeneratedMaze((last) => ({
                ...last,
                downloadType: e.target.value as IMazeGenerated['downloadType']
              }))
            }
          }}>
            <option value='json' >json</option>
            {/* <option value='images' >images</option> */}
          </select>
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
