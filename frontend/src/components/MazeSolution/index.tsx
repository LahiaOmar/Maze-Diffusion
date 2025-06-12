import { useEffect, useState } from 'react';
import { generateDumyMaze, generateSingleMaze, renderMaze, TMaze, TPoint } from '../MazeGenerator/Utils'
import cx from 'classnames'

interface IMazeSolution {
  maze: TMaze | null;
  solution:TPoint[] | null,
  start: TPoint | null,
  end: TPoint | null,
  size: number;
  loadingResponse: boolean;
}

const INIT_STATE: IMazeSolution = {
    maze: null,
    solution: null,
    start: null,
    end: null,
    size: 28,
    loadingResponse: false,
}
const MazeSolution = () => {
  const [state, setState] = useState<IMazeSolution>(INIT_STATE)

  const resetState = () => {
    setState(INIT_STATE)
  }

  const generateMaze = () => {
    resetState()
    const { maze, start, end, solution: _solution } = generateSingleMaze(state.size)

    setState((last) => ({
      ...last,
      maze,
      start,
      end,
      trueSolution : _solution
    }))
  }

  const solveMaze = async () => {
    setState((last) => ({ ...last, loadingResponse: true }))

    if(state.maze && state.end && state.start){
      // call server
      const response = await fetch('solve', {
        method: 'POST',
        body: JSON.stringify({
          maze: state.maze,
          startAndEnd: state.maze.map((row, ii) => {
            return row.map((_, jj) => {
              if(ii === state.start?.x && jj === state.start.y){
                return 1
              }
              else if(ii === state.end?.x && jj === state.end.y){
                return 1
              }

              return 0
            })
          })
        }),
        headers: {
          "content-type": "application/json"
        }
      })

      const data = await response.json()
      if(data.solution){
        const _solution = data.solution as Array<Array<number>>
        const keep: TPoint[] = []

        _solution.forEach((row, i) => {
          row.forEach((cell, j) => {
            
            if(cell >= 0.9){
              keep.push({ x : i, y: j})
            }
          })
        })

        setState((last) => ({
          ...last, 
          solution: keep,
        }))
      }
    }

    setState((last) => ({...last, loadingResponse: false}))
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
          ? renderMaze(state.maze, state.solution, state.start, state.end, { showSolution: true })
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
            className={cx(
              "focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800",
              {
                "animate-pulse": state.loadingResponse
              }
            )}
            onClick={solveMaze}>
              {
                state.loadingResponse ? 'solving ...' : 'solve'
              }
          </button>
      </div>
    </div>
  )
}

export default MazeSolution