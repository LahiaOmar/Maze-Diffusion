import cx from 'classnames'

export type TPoint = { x: number, y: number }
export type TMaze = Array<Array<number>>

const getUnvisitedNeighbors = (current: TPoint, maze: TMaze, step = 2) => {
  const { x, y } = current;
  const neighbors = [];
  const directions = [
    { dx: 0, dy: -step }, 
    { dx: step, dy: 0 },  
    { dx: 0, dy: step },  
    { dx: -step, dy: 0 }
  ];

  
  for (const dir of directions) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;

    if (nx < 0 || nx >= maze[0].length || ny < 0 || ny >= maze.length) {
      continue;
    }

    if (maze[ny][nx] === 0) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
}


const generateDumyMaze = (size: number) => {
  const maze = Array(size).fill(null).map(() => Array(size).fill(1)) as TMaze;
  
  return maze
}

const generateMaze = (width: number, height: number, start: TPoint) => {
  const maze = Array(height).fill(null).map(() => Array(width).fill(0)) as TMaze;
  const stack = [start] as TPoint[]

  maze[start.y][start.x] = 1;

  while(stack.length > 0){
    const current = stack.pop();
    
    if(!current) return maze;

    const neighbors = getUnvisitedNeighbors(current, maze);

    if(neighbors.length > 0){
      stack.push(current);
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      maze[next.y][next.x] = 1;
      maze[current.y + (next.y - current.y) / 2][current.x + (next.x - current.x) / 2] = 1;

      stack.push(next);
    }
  }

  return maze
}


const mazeToString = (maze: TMaze, start: TPoint, end: TPoint) => {
  const symbols = {
    wall: '#',
    path: '.',
    start: 'S',
    end: 'E'
  };

  const strMaze = []

  for (let y = 0; y < maze.length; y++) {
    let row = '';
    for (let x = 0; x < maze[y].length; x++) {
      if (x === start.x && y === start.y) {
        row += symbols.start;
      } else if (x === end.x && y === end.y) {
        row += symbols.end;
      } else {
        row += maze[y][x] === 1 ? symbols.wall : symbols.path;
      }
      row += ' '; // Add spacing for readability
    }
    strMaze.push(row)
  }

  return strMaze.join('\n')
}

const solveMaze = (maze: number[][], start: TPoint, end: TPoint) => {
  const visited = new Set(); 
  const path: TPoint[] = []; 

  const dfs = (x: number, y: number) => {
    if (x === end.x && y === end.y) {
      return true;
    }

    if(x < 0 || y < 0){
      return false;
    } 

    if (
      x >= maze.length || // out of bounds
      y >= maze.length || // out of bounds
      maze[x][y] === 0 || // walls
      visited.has(`${x},${y}`) // already visited.
    ) {
      return false;
    }

    visited.add(`${x},${y}`);
    path.push({x, y});

    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const [dx, dy] of directions) {
      if (dfs(x + dx, y + dy)) {
        return true; 
      }
    }

    path.pop();
    return false;
  }

  dfs(start.x, start.y);

  return path ;
}

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
                <span
                  title='start'
                  key={`${i},${j}`}
                  className={cx('w-4 h-4 text-center bg-blue-400')}
                ></span>
              );
            }

            if (i === end.x && j === end.y) {
              return (
                <span 
                  title='end'
                  key={`${i},${j}`}
                  className="cursor-pointer w-4 h-4 text-center bg-red-400"
                ></span>
              );
            }

            if (showSolution && solution.find((p) => p.x === i && p.y === j)) {
              return (
                <div
                  key={`${i},${j}`}
                  className="w-4 h-4 text-center bg-green-300"
                ></div>
              );
            }

            if (mazeCell === 1) {
              return (
                <div
                  key={`${i},${j}`}
                  className="w-4 h-4 text-center bg-gray-100"
                ></div>
              );
            }

            return (
              <div
                key={`${i},${j}`}
                className={cx(
                  'w-4 h-4 text-center border-black bg-black',
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

const generateSingleMaze = (size: number) => {
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

export {
  generateSingleMaze,
  generateDumyMaze,
  generateMaze,
  mazeToString,
  renderMaze,
  solveMaze,
}