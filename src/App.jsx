import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [banis, setBanis] = useState([
    { name: "Japji Sahib", completed: false },
    { name: "Jaap Sahib", completed: false },
    { name: "Rehras Sahib", completed: false },
    { name: "Kirtan Sohila", completed: false },
    { name: "Anand Sahib", completed: false },
  ])
  const [streak, setStreak] = useState(0)

  useEffect(function () {
    fetch(`${import.meta.env.VITE_API_URL}/streak-db`)
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        setStreak(data.currentStreak)
      })
  }, [])

  function saveToday() {
    const completedNames = banis
      .filter(function (bani) {
        return bani.completed
      })
      .map(function (bani) {
        return bani.name
      })

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const dateString = year + "-" + month + "-" + day

    fetch(`${import.meta.env.VITE_API_URL}/daily-log-db`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateString, baniNames: completedNames }),
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        console.log("Saved:", data)
      })
  }

  return (
    <div className="app">
  <h1>Nitnem Tracker</h1>
  <p className="streak">Current streak: <strong>{streak} days</strong></p>
  <div className="checklist">
    {banis.map(function (bani, index) {
      return (
        <label className="bani-item" key={index}>
          <input
            type="checkbox"
            checked={bani.completed}
            onChange={function () {
              const updatedBanis = banis.map(function (b, i) {
                if (i === index) {
                  return { ...b, completed: !b.completed }
                } else {
                  return b
                }
              })
              setBanis(updatedBanis)
            }}
          />
          {bani.name}
        </label>
      )
    })}
  </div>
  <button onClick={saveToday}>Save Today's Log</button>
</div>
  )
}

export default App