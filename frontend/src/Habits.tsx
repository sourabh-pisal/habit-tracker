import { JSX, useEffect, useState } from "react";
import "./Habits.css";

const API_URL = process.env.REACT_APP_BACKEND_URL!;

export type Habit = {
  readonly id: string;
  readonly name: string;
  readonly history: Record<string, boolean>;
};

const getPastWeekDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

export default function Habits(): JSX.Element {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const dates = getPastWeekDates();

  useEffect(() => {
    const fetchHabits = async () => {
      const res = await fetch(API_URL);
      const data = await res.json();
      setHabits(data);
    };
    fetchHabits();
  }, []);

  const handleAdd = async () => {
    if (!newHabit.trim()) return;
    const newH: Habit = {
      id: Date.now().toString(),
      name: newHabit,
      history: { [new Date().toISOString().split("T")[0]]: false },
    };

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newH),
    });
    const filtered = {
      ...newH,
      history: dates.reduce((acc, d) => ({ ...acc, [d]: false }), {}),
    };
    setHabits([...habits, filtered]);
    setNewHabit("");
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setHabits(habits.filter((h) => h.id !== id));
  };

  const handleToggle = async (id: string, date: string) => {
    await fetch(`${API_URL}/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });
    setHabits(
      habits.map((h) => {
        if (h.id === id) {
          return {
            ...h,
            history: {
              ...h.history,
              [date]: !h.history[date],
            },
          };
        }
        return h;
      }),
    );
  };

  return (
    <div className="container">
      <h1 className="title">Habit Tracker</h1>

      <div className="inputContainer">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Add a new habit"
          className="input"
        />
        <button onClick={handleAdd} className="addButton">
          Add
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Habit</th>
            {dates.map((date) => (
              <th key={date}>{date.slice(5)}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id}>
              <td>{habit.name}</td>
              {dates.map((date) => (
                <td key={date} className="checkboxCell">
                  <input
                    type="checkbox"
                    checked={habit.history[date] || false}
                    onChange={() => handleToggle(habit.id, date)}
                  />
                </td>
              ))}
              <td>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="deleteButton"
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
