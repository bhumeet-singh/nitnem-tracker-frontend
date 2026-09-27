import { useState, useEffect } from 'react'
import './App.css'

// Turns "2026-09-26" into "Sat, Sep 26".
// We split the string ourselves instead of using new Date("2026-09-26"),
// because that form is read as midnight UTC, which is still Sep 25 in
// Massachusetts. new Date(year, monthIndex, day) uses local time instead.
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function App() {
  const [banis, setBanis] = useState([
    { name: "Japji Sahib", completed: false },
    { name: "Jaap Sahib", completed: false },
    { name: "Rehras Sahib", completed: false },
    { name: "Kirtan Sohila", completed: false },
    { name: "Anand Sahib", completed: false },
  ])
  const [streak, setStreak] = useState(0)
  const [history, setHistory] = useState([])

  function loadStreak() {
    fetch(`${import.meta.env.VITE_API_URL}/streak-db`)
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        setStreak(data.currentStreak)
      })
  }

  function loadHistory() {
    fetch(`${import.meta.env.VITE_API_URL}/history`)
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        // On an error, the backend sends an object instead of an array.
        // Only store real arrays, so history.map() below can't crash.
        if (Array.isArray(data)) {
          setHistory(data)
        }
      })
  }

  useEffect(function () {
    loadStreak()
    loadHistory()
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
        // The database changed, so re-fetch what the page shows from it.
        loadHistory()
        loadStreak()
      })
  }

  return (
    <div className="app">
      <h1>Nitnem Tracker</h1>
      <p className="streak">Current streak: <strong>{streak} days</strong></p>

      <div className="layout">
        <section className="today">
          <h2>Today</h2>
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
        </section>

        <section className="history">
          <h2>History</h2>
          {history.length === 0 ? (
            <p className="history-empty">Save a log to start your history.</p>
          ) : (
            <ul className="history-list">
              {history.map(function (log) {
                // "Japji Sahib, Rehras Sahib" -> ["Japji Sahib", "Rehras Sahib"]
                const doneNames = log.completed ? log.completed.split(", ") : []

                return (
                  <li className="history-item" key={log.date}>
                    <div className="history-row">
                      <span className="history-date">{formatDate(log.date)}</span>
                      <span className="history-dots">
                        {banis.map(function (bani) {
                          const done = doneNames.includes(bani.name)
                          return (
                            <span
                              key={bani.name}
                              className={done ? "dot dot-done" : "dot"}
                              title={bani.name}
                            ></span>
                          )
                        })}
                      </span>
                      <span className="history-count">{doneNames.length}/5</span>
                    </div>
                    <p className="history-banis">
                      {doneNames.length > 0 ? log.completed : "No banis logged"}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default App