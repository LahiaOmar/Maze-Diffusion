import { Route, Routes } from 'react-router';
import './App.css';
import MazeGenerator from './components/MazeGenerator';
import MazeSolution from './components/MazeSolution';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-10 justify-between gap-4 sm:gap-5">
      <div className="flex items-center justify-center flex-1 min-h-0 w-full max-w-full">
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
