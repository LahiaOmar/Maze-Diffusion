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

export {
  generateMaze,
  mazeToString,
  solveMaze,
}