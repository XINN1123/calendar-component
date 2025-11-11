import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CalendarView from "./components/Calendar/CalendarView";
import type { CalendarEvent } from "./components/Calendar/CalendarView.types";

const App = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Team Meeting",
      description: "Discuss sprint planning and Q4 goals",
      startDate: new Date(2025, 10, 11, 10, 0), // Nov 11, 2025 at 10:00 AM
      endDate: new Date(2025, 10, 11, 11, 30), // Nov 11, 2025 at 11:30 AM
      color: "#3B82F6",
      category: "Work",
    },
    {
      id: "2",
      title: "Doctor Appointment",
      description: "Annual checkup",
      startDate: new Date(2025, 10, 12, 15, 0), // Nov 12, 2025 at 3:00 PM
      endDate: new Date(2025, 10, 12, 16, 0), // Nov 12, 2025 at 4:00 PM
      color: "#10B981",
      category: "Personal",
    },
    {
      id: "3",
      title: "Lunch with Team",
      description: "Team bonding lunch",
      startDate: new Date(2025, 10, 13, 12, 0), // Nov 13, 2025 at 12:00 PM
      endDate: new Date(2025, 10, 13, 13, 30), // Nov 13, 2025 at 1:30 PM
      color: "#F97316",
      category: "Work",
    },
  ]);

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const handleEventUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const handleEventDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <CalendarView
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="month"
        initialDate={new Date()}
      />
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
