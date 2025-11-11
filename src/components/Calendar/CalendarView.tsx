import React, { useState, useEffect, useCallback } from "react";
import type { CalendarViewProps, CalendarEvent } from "./CalendarView.types";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import EventModal from "./EventModal";
import { useCalendar } from "../../hooks/useCalendar";
import { useEventManager } from "../../hooks/useEventManager";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CalendarView: React.FC<CalendarViewProps> = ({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  initialView = "month",
  initialDate = new Date(),
}) => {
  const { selectedDate, goToNextMonth, goToPrevMonth, setDate } = useCalendar(initialDate);
  const { events: managedEvents, addEvent, updateEvent, deleteEvent } = useEventManager(events);

  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<"month" | "week">(initialView);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);

  const [tempMonth, setTempMonth] = useState(selectedDate.getMonth());
  const [tempYear, setTempYear] = useState(selectedDate.getFullYear());
  const [tempDay, setTempDay] = useState(selectedDate.getDate());

  //  Ensure valid day per month
  useEffect(() => {
    const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
    if (tempDay > daysInMonth) setTempDay(daysInMonth);
  }, [tempMonth, tempYear]);

  // ➕ Add or Update Event
  const handleSaveEvent = (event: CalendarEvent) => {
    if (editEvent && editEvent.id) {
      // Editing existing event
      updateEvent(editEvent.id, event);
      if (onEventUpdate) onEventUpdate(editEvent.id, event);
    } else {
      // Adding new event
      addEvent(event);
      if (onEventAdd) onEventAdd(event);
    }
    setEditEvent(null);
    setShowModal(false);
  };

  //  Delete Event
  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
    if (onEventDelete) onEventDelete(id);
  };

  //  Edit Event (click to open modal with event data)
  const handleEventClick = (event: CalendarEvent) => {
    setEditEvent(event);
    setShowModal(true);
  };

  //  Create Event from drag selection (WeekView)
  const handleCreateRange = (start: Date, end: Date) => {
    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      startDate: start,
      endDate: end,
      color: "#3B82F6",
      category: "General",
    };
    setEditEvent(newEvent);
    setShowModal(true);
  };

  //  Handle day click from MonthView
  const handleDayClick = (date: Date) => {
    const startDate = new Date(date);
    startDate.setHours(9, 0, 0, 0); // Default to 9 AM
    const endDate = new Date(date);
    endDate.setHours(10, 0, 0, 0); // Default to 10 AM (1 hour duration)
    
    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      startDate,
      endDate,
      color: "#3B82F6",
      category: "General",
    };
    setEditEvent(newEvent);
    setShowModal(true);
  };

  // �Jump to Date (from popup)
  const handleGoToDate = () => {
    const newDate = new Date(tempYear, tempMonth, tempDay);
    if (setDate) setDate(newDate);
    setShowDateSelector(false);
  };

  //  Mini calendar grid for popup
  const generateMiniMonthGrid = useCallback(() => {
    const firstDay = new Date(tempYear, tempMonth, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
    const days: (number | null)[] = Array(startDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [tempMonth, tempYear]);

  //  Auto update month header when WeekView changes
  const handleWeekChange = (newDate: Date) => {
    if (setDate) setDate(newDate);
  };

  // Jump to Today
  const handleGoToToday = () => {
    const today = new Date();
    if (setDate) setDate(today);
  };

  //  Swipe Navigation (mobile only)
  useEffect(() => {
    if (window.innerWidth > 1024) return;
    let startX = 0;
    let endX = 0;

    const handleTouchStart = (e: TouchEvent) => (startX = e.touches[0].clientX);
    const handleTouchMove = (e: TouchEvent) => (endX = e.touches[0].clientX);
    const handleTouchEnd = () => {
      const diff = endX - startX;
      if (Math.abs(diff) > 80) {
        if (diff > 0) {
          if (view === "month") goToPrevMonth();
          else handleWeekChange(new Date(selectedDate.setDate(selectedDate.getDate() - 7)));
        } else {
          if (view === "month") goToNextMonth();
          else handleWeekChange(new Date(selectedDate.setDate(selectedDate.getDate() + 7)));
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [view, selectedDate]);

  return (
    <div className="p-2 sm:p-4 bg-white rounded-lg sm:rounded-2xl shadow-md w-full max-w-6xl mx-auto select-none">
      {/* ===== Header ===== */}
      <div className="relative flex items-center justify-center mb-3 sm:mb-4">
        <button
          onClick={goToPrevMonth}
          aria-label="Previous month"
          className="absolute left-0 sm:left-2 px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300 transition"
        >
          ←
        </button>

        <h1
          onClick={() => setShowDateSelector(true)}
          className="text-base sm:text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition"
        >
          {selectedDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h1>

        <button
          onClick={goToNextMonth}
          aria-label="Next month"
          className="absolute right-0 sm:right-2 px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300 transition"
        >
          →
        </button>
      </div>

      {/* ===== Controls ===== */}
      <div className="flex justify-center mb-3 sm:mb-4 gap-1 sm:gap-2 flex-wrap">
        <button
          onClick={() => setView("month")}
          className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md font-medium text-xs sm:text-sm transition ${
            view === "month"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setView("week")}
          className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md font-medium text-xs sm:text-sm transition ${
            view === "week"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Week
        </button>
        <button
          onClick={handleGoToToday}
          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm font-medium transition"
        >
          Today
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-blue-700 transition text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">+ Add Event</span>
          <span className="sm:hidden">+ Add</span>
        </button>
      </div>

      {/* ===== Calendar View ===== */}
      <div className="mt-2">
        {view === "month" ? (
          <MonthView
            events={managedEvents}
            selectedDate={selectedDate}
            onDeleteEvent={handleDeleteEvent}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        ) : (
          <WeekView
            events={managedEvents}
            selectedDate={selectedDate}
            onDeleteEvent={handleDeleteEvent}
            onWeekChange={handleWeekChange}
            onEventClick={handleEventClick}
            onCreateRange={handleCreateRange}
          />
        )}
      </div>

      {/* ===== Event Modal ===== */}
      {showModal && (
        <EventModal
          onClose={() => {
            setEditEvent(null);
            setShowModal(false);
          }}
          onSave={handleSaveEvent}
          initialData={editEvent}
        />
      )}

      {/* ===== Date Selector Popup ===== */}
      {showDateSelector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-4 w-[340px] max-sm:w-[90%] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3 text-center text-gray-700">
              Select Date
            </h2>
            <div className="flex gap-2 mb-3">
              <select
                value={tempMonth}
                onChange={(e) => setTempMonth(Number(e.target.value))}
                className="w-1/2 border rounded-md p-2 text-sm"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={tempYear}
                onChange={(e) => setTempYear(Number(e.target.value))}
                className="w-1/2 border rounded-md p-2 text-sm"
                min="1900"
                max="2100"
              />
            </div>

            {/* Mini Calendar */}
            <div className="grid grid-cols-7 gap-1 text-xs text-center mb-4">
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <div key={d} className="font-semibold text-gray-600">
                  {d}
                </div>
              ))}
              {generateMiniMonthGrid().map((day, i) =>
                day ? (
                  <button
                    key={i}
                    onClick={() => setTempDay(day)}
                    className={`py-1 rounded-md transition ${
                      day === tempDay
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div key={i}></div>
                )
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDateSelector(false)}
                className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleGoToDate}
                className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
