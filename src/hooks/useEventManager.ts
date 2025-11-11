import { useState } from "react";
import type { CalendarEvent } from "../components/Calendar/CalendarView.types";

export const useEventManager = (initialEvents: CalendarEvent[] = []) => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  const addEvent = (event: CalendarEvent) => setEvents((prev) => [...prev, event]);
  const deleteEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));
  const updateEvent = (id: string, updates: Partial<CalendarEvent>) =>
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );

  return { events, addEvent, deleteEvent, updateEvent };
};
