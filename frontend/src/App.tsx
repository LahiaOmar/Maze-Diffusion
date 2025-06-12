import { Route, Routes } from 'react-router';
import './App.css';
import MazeGenerator from './components/MazeGenerator';
import MazeSolution from './components/MazeSolution';

function App() {
  return (
    <div className="flex space-y-5 flex-col">
      <h1 className="text-center text-3xl">Maze Diffusion Solver</h1>
      <div className="flex items-center justify-center">
        <Routes>
          <Route path="/" element={<MazeSolution />} />
          <Route path="/dataset" element={<MazeGenerator />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
