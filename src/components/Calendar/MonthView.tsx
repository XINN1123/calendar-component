import React, { useState, useRef, useEffect } from "react";
import type { CalendarEvent } from "./CalendarView.types";

export interface MonthViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDeleteEvent: (id: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  events,
  selectedDate,
  onDeleteEvent,
  onEventClick,
  onDayClick,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const generateCalendarDays = () => {
    const monthStart = getMonthStart(selectedDate);
    const monthEnd = getMonthEnd(selectedDate);
    const startDayOfWeek = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const days: Date[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(monthStart);
      day.setDate(day.getDate() - i - 1);
      days.push(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(monthEnd);
      day.setDate(monthEnd.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  const calendarDays = generateCalendarDays();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && !document.activeElement.closest('[role="grid"]')) {
        return;
      }

      let newIndex = focusedIndex;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          newIndex = Math.max(0, focusedIndex - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          newIndex = Math.min(41, focusedIndex + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          newIndex = Math.max(0, focusedIndex - 7);
          break;
        case "ArrowDown":
          e.preventDefault();
          newIndex = Math.min(41, focusedIndex + 7);
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = 41;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (onDayClick) {
            onDayClick(calendarDays[focusedIndex]);
          }
          return;
        default:
          return;
      }

      setFocusedIndex(newIndex);
      cellRefs.current[newIndex]?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, calendarDays, onDayClick]);

  return (
    <div className="overflow-x-auto" role="grid" aria-label="Calendar month view">
      <div className="grid grid-cols-7 gap-2 mb-2 max-sm:gap-1" role="row">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs sm:text-sm font-semibold text-neutral-600 py-1 sm:py-2"
            role="columnheader"
          >
            <span className="hidden sm:inline">{name}</span>
            <span className="sm:hidden">{name.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 max-sm:gap-1">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isToday =
            day.getDate() === new Date().getDate() &&
            day.getMonth() === new Date().getMonth() &&
            day.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={`${day.toISOString()}-${index}`}
              ref={(el) => { cellRefs.current[index] = el; }}
              tabIndex={0}
              role="gridcell"
              aria-label={`${day.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}${dayEvents.length > 0 ? `, ${dayEvents.length} events` : ""}`}
              className={`border rounded-lg p-1 sm:p-2 h-20 sm:h-32 hover:bg-neutral-50 transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none ${
                isToday
                  ? "bg-blue-50 border-blue-300"
                  : isCurrentMonth
                  ? "bg-white border-neutral-200"
                  : "bg-neutral-50 border-neutral-100"
              }`}
              onClick={() => onDayClick && onDayClick(day)}
              onFocus={() => setFocusedIndex(index)}
            >
              <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                {isToday ? (
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full text-white text-[10px] sm:text-xs flex items-center justify-center font-medium">
                    {day.getDate()}
                  </span>
                ) : (
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isCurrentMonth ? "text-neutral-900" : "text-neutral-400"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                )}
              </div>

              <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Event: ${event.title}`}
                    className="group relative text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded truncate cursor-pointer hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: event.color || "#3B82F6",
                      color: "#FFFFFF",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick && onEventClick(event);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onEventClick && onEventClick(event);
                      }
                    }}
                    title={`${event.title}\n${event.startDate.toLocaleString()} - ${event.endDate.toLocaleString()}\nClick to edit, X to delete`}
                  >
                    <span className="truncate block pr-3 sm:pr-4">{event.title}</span>
                    <button
                      className="absolute right-0 top-0 bottom-0 px-1 opacity-0 group-hover:opacity-100 hover:bg-black/20 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${event.title}"?`)) {
                          onDeleteEvent(event.id);
                        }
                      }}
                      aria-label={`Delete ${event.title}`}
                      title="Delete event"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <button
                    className="text-[10px] sm:text-xs text-blue-600 hover:underline pl-1 sm:pl-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick && onDayClick(day);
                    }}
                    aria-label={`${dayEvents.length - 3} more events on this day`}
                  >
                    +{dayEvents.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;