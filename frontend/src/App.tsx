import './App.css'
import MazeGenerator from './components/MazeGenerator'

function App() {
  return (
    <div className='flex space-y-5 flex-col'>
      <h1 className='text-center text-3xl'>
        Maze DataSet Generator
      </h1>
      <div className='flex items-center justify-center'>
        {/* maze generator */}
        <MazeGenerator />
      </div>
    </div>
  )
}

export default App
