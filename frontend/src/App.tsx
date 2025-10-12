import { Route, Routes } from 'react-router';
import './App.css';
import MazeGenerator from './components/MazeGenerator';
import MazeSolution from './components/MazeSolution';
import Footer from './components/Footer';
import SEO from './components/SEO';

function App() {
  return (
    <>
      <SEO />
      <div className="flex space-y-5 flex-col h-screen bg-slate-100 p-10 justify-between">
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        
        {/* Main content area with proper semantic structure */}
        <main id="main-content" className="flex items-center justify-center" role="main">
          <Routes>
            <Route path="/" element={<MazeSolution />} />
            <Route path="/dataset" element={<MazeGenerator />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

export default App;
