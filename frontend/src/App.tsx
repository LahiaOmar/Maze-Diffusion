import { Route, Routes } from 'react-router';
import './App.css';
import MazeGenerator from './components/MazeGenerator';
import MazeSolution from './components/MazeSolution';

function App() {
  return (
    <div className="flex space-y-5 flex-col h-screen bg-slate-100 p-10">
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
