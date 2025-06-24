import { Route, Routes } from 'react-router';
import './App.css';
import MazeGenerator from './components/MazeGenerator';
import MazeSolution from './components/MazeSolution';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex space-y-5 flex-col h-screen bg-slate-100 p-10 justify-between">
      <div className="flex items-center justify-center">
        <Routes>
          <Route path="/" element={<MazeSolution />} />
          <Route path="/dataset" element={<MazeGenerator />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
