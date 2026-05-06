import TimeEntryForm from './components/TimeEntryForm'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-4xl p-4">
        <h1 className="text-3xl font-extrabold text-center mb-10 text-gray-800">
          Enterprise Time Logger
        </h1>
        <TimeEntryForm />
      </div>
    </div>
  )
}

export default App
