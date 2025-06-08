import { useEffect, useState } from 'react';
import { generateDumyMaze, generateSingleMaze, renderMaze, TMaze, TPoint } from '../MazeGenerator/Utils'

interface IMazeSolution {
  maze: TMaze | null;
  solution:TPoint[] | null,
  start: TPoint | null,
  end: TPoint | null,
  size: number;
}

const MazeSolution = () => {
  const [state, setState] = useState<IMazeSolution>({
    maze: null,
    solution: null,
    start: null,
    end: null,
    size: 28,
  })

  const generateMaze = () => {
    const { maze, start, end } = generateSingleMaze(state.size)

    setState((last) => ({
      ...last,
      maze,
      start,
      end
    }))
  }

  const solveMaze = () => {
    if(state.maze){
      // call server
    }
  }

  useEffect(() => {
    generateMaze()
  }, [])
  
  return (
    <div className="space-y-2">
      {/* maze + solution */}
      <div className="h-full flex items-center space-x-2">
        {
          // looks ugly!!!! TODO
          (state.maze && state.end && state.start) && renderMaze(state.maze, [], state.start, state.end, { showSolution: false })
        }
        <div>
        {
          // looks ugly!!!! TODO
          state.solution && (state.maze && state.end && state.start) 
          ? renderMaze(state.maze, [], state.start, state.end, { showSolution: false })
          : renderMaze(generateDumyMaze(state.size), [], {x: -1, y: -1}, {x: -1, y: -1}, { showSolution: false })
        }
        </div>
      </div>
      {/* solve button */}
      <div className='w-full flex justify-center items-center space-x-3.5'>
        <button 
          type="button" 
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={generateMaze}>
          generate maze
        </button>

        <button 
          type="button" 
          className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          onClick={solveMaze}>
            Solve
        </button>

      </div>
    </div>
  )
}

export default MazeSolution