import React, { useRef, useEffect, useState } from "react";
import type { CalendarEvent } from "./CalendarView.types";
import { getWeekRange, isSameDay } from "../../utils/date.utils";

/**
 * WeekView
 *
 * Props:
 * - selectedDate: Date   // date inside the week to show
 * - events: CalendarEvent[]
 * - onDeleteEvent(id)
 * - onEventClick(ev)
 * - onCreateRange(start: Date, end: Date) -> called when user finishes drag-to-create
 *
*/



const PX_PER_30MIN = 40; 


const minutesToPx = (m: number) => (m / 30) * PX_PER_30MIN;

const pxToMinutes = (px: number) => (px / PX_PER_30MIN) * 30;


const minutesSinceMidnight = (d: Date) => d.getHours() * 60 + d.getMinutes();


const roundTo15 = (m: number) => Math.round(m / 15) * 15;

// minimal event duration in minutes
const MIN_EVENT_MINUTES = 15;


function computeOverlaps(list: { id: string; start: number; end: number }[]) {
  const items = list.slice().sort((a, b) => a.start - b.start || a.end - b.end);
  const groups: { members: typeof items }[] = [];

  for (const ev of items) {
    let placed = false;
    for (const g of groups) {
      // overlap check (if any member overlaps)
      if (g.members.some((m) => m.end > ev.start && m.start < ev.end)) {
        g.members.push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push({ members: [ev] });
  }

  // For each group, assign columns greedily
  const result: Record<string, { col: number; cols: number }> = {};
  for (const g of groups) {
    const columnsEnd: number[] = []; // end minute for each column
    for (const ev of g.members) {
      let assigned = -1;
      for (let c = 0; c < columnsEnd.length; c++) {
        if (columnsEnd[c] <= ev.start) {
          assigned = c;
          columnsEnd[c] = ev.end;
          break;
        }
      }
      if (assigned === -1) {
        assigned = columnsEnd.length;
        columnsEnd.push(ev.end);
      }
      result[ev.id] = { col: assigned, cols: columnsEnd.length };
    }
  }

  return result;
}

/*  */

interface WeekViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onDeleteEvent: (id: string) => void;
  onEventClick?: (ev: CalendarEvent) => void;
  onCreateRange?: (start: Date, end: Date) => void;
  onWeekChange?: (newDate: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WeekView: React.FC<WeekViewProps> = ({
  selectedDate,
  events,
  onDeleteEvent,
  onEventClick,
  onCreateRange,
}) => {
  // Ensure selectedDate is valid
  const validDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime()) 
    ? selectedDate 
    : new Date();
  
  // Generate array of 7 days for the week (Sun..Sat)
  const [weekStart] = getWeekRange(validDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });
  
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drag state for pointer create
  const [dragState, setDragState] = useState<{
    active: boolean;
    dayIndex: number | null;
    startMinutes: number;
    endMinutes: number;
    topPx: number;
    heightPx: number;
  } | null>(null);

  // pointer down data to calculate offsets
  const pointerData = useRef<{ startY: number; startMin: number; dayIdx: number } | null>(null);

  // build events grouped per day and compute overlap positions
  const safeEvents = events || [];
  const eventsByDay = weekDays.map((day) =>
    safeEvents.filter((ev) => ev && ev.startDate && isSameDay(ev.startDate, day))
  );

  const eventPositionsByDay = eventsByDay.map((dayEvents) => {
    const ranges = dayEvents.map((ev) => {
      const start = minutesSinceMidnight(ev.startDate);
      const end = minutesSinceMidnight(ev.endDate);
      return { id: ev.id, start, end };
    });
    return computeOverlaps(ranges);
  });

  /* ---------------- Pointer handlers for drag-to-create ---------------- */

  useEffect(() => {
    const doc = document;
    function onPointerMove(e: PointerEvent) {
      if (!pointerData.current) return;
      const { startY, startMin, dayIdx } = pointerData.current;
      const currentY = e.clientY;
      const deltaPx = currentY - startY;
      const deltaMin = pxToMinutes(Math.abs(deltaPx));
      let newStartMin = startMin;
      let newEndMin = startMin + deltaMin;
      if (deltaPx < 0) {
        // dragging upward
        newStartMin = startMin - deltaMin;
        newEndMin = startMin;
      }
      // clamp between 0 and 24*60
      newStartMin = Math.max(0, Math.min(24 * 60 - MIN_EVENT_MINUTES, newStartMin));
      newEndMin = Math.max(MIN_EVENT_MINUTES, Math.min(24 * 60, newEndMin));
      // round to nearest 15
      newStartMin = roundTo15(newStartMin);
      newEndMin = Math.max(newStartMin + MIN_EVENT_MINUTES, roundTo15(newEndMin));

      const topPx = minutesToPx(Math.min(newStartMin, newEndMin));
      const heightPx = minutesToPx(Math.abs(newEndMin - newStartMin));

      setDragState({
        active: true,
        dayIndex: dayIdx,
        startMinutes: Math.min(newStartMin, newEndMin),
        endMinutes: Math.max(newStartMin, newEndMin),
        topPx,
        heightPx,
      });
    }

    function onPointerUp() {
      if (!pointerData.current || !dragState) {
        pointerData.current = null;
        setDragState(null);
        return;
      }
      const { dayIdx } = pointerData.current;
      const startMin = dragState.startMinutes;
      const endMin = dragState.endMinutes;
      // build Date objects for selected day
      const day = weekDays[dayIdx];
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      start.setMinutes(startMin);
      const end = new Date(day);
      end.setHours(0, 0, 0, 0);
      end.setMinutes(endMin);

      // cleanup UI
      pointerData.current = null;
      setDragState(null);

      // callback
      onCreateRange?.(start, end);
    }

    doc.addEventListener("pointermove", onPointerMove);
    doc.addEventListener("pointerup", onPointerUp);
    doc.addEventListener("pointercancel", onPointerUp);

    return () => {
      doc.removeEventListener("pointermove", onPointerMove);
      doc.removeEventListener("pointerup", onPointerUp);
      doc.removeEventListener("pointercancel", onPointerUp);
    };
  }, [dragState, onCreateRange, weekDays]);

  // Start pointer capture when pointerdown on a day column
  const handlePointerDownOnDay = (e: React.PointerEvent, dayIdx: number) => {
    // Only left button
    if (e.button !== 0) return;

    // prevent text selection
    (e.target as Element).setPointerCapture?.(e.pointerId);

    // compute start minutes from pointer position relative to column top
    const col = (e.currentTarget as HTMLElement);
    const rect = col.getBoundingClientRect();
    const y = e.clientY - rect.top; // px within column
    let minutes = Math.floor(pxToMinutes(y));
    minutes = Math.max(0, Math.min(24 * 60 - MIN_EVENT_MINUTES, minutes));
    minutes = roundTo15(minutes);

    pointerData.current = { startY: e.clientY, startMin: minutes, dayIdx };

    // initialize drag state (zero-height)
    const topPx = minutesToPx(minutes);
    setDragState({
      active: true,
      dayIndex: dayIdx,
      startMinutes: minutes,
      endMinutes: minutes + MIN_EVENT_MINUTES,
      topPx,
      heightPx: minutesToPx(MIN_EVENT_MINUTES),
    });
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="border rounded-lg sm:rounded-xl p-2 sm:p-3 bg-white overflow-x-auto overflow-y-auto max-h-[85vh]" role="grid" aria-label="Calendar week view">
      {/* header row */}
      <div className="flex mb-2 sm:mb-3 sticky top-0 bg-white z-20 min-w-[700px] sm:min-w-[1000px] pb-2 border-b">
        {/* time column spacer */}
        <div className="w-14 sm:w-20 flex-shrink-0"></div>
        {/* weekday headers */}
        {weekDays.map((d) => {
          const isToday = isSameDay(d, new Date());
          return (
            <div key={d.toDateString()} className={`flex-1 text-center font-semibold ${isToday ? "text-blue-600" : "text-gray-700"}`}>
              <div className="text-xs sm:text-sm mb-1">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div className={`text-sm sm:text-base ${isToday ? "bg-blue-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mx-auto font-bold" : "text-gray-600"}`}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex min-w-[700px] sm:min-w-[1000px]">
        {/* Time labels column */}
        <div className="w-14 sm:w-20 flex-shrink-0 relative" style={{ height: minutesToPx(24 * 60) }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="text-[10px] sm:text-xs text-gray-600 text-right pr-2 sm:pr-3 -translate-y-2 font-medium"
              style={{ position: "absolute", top: minutesToPx(h * 60) }}
            >
              {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day, idx) => {
            const dayEvents = eventsByDay[idx];
            const positions = eventPositionsByDay[idx] || {};
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toDateString()}
                className={`relative border-l border-gray-200 flex-1 ${isToday ? "bg-blue-50/30" : "bg-white"}`}
                onPointerDown={(e) => handlePointerDownOnDay(e, idx)}
                ref={idx === 0 ? containerRef : undefined}
                data-day-index={idx}
                role="gridcell"
                tabIndex={0}
                aria-label={`${day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`}
                style={{ minHeight: minutesToPx(24 * 60) }}
              >
                {/* grid lines: 24 hourly lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {HOURS.map((h) => (
                    <div key={h} className="border-t border-gray-200" style={{ height: minutesToPx(60) }}>
                      {/* 30-minute subline */}
                      <div className="border-t border-gray-100" style={{ height: minutesToPx(30) }}></div>
                    </div>
                  ))}
                </div>

              {/* events positioned absolutely */}
              <div className="relative h-full">
                {dayEvents.map((ev) => {
                  const start = minutesSinceMidnight(ev.startDate);
                  const end = minutesSinceMidnight(ev.endDate);
                  const duration = Math.max(MIN_EVENT_MINUTES, end - start);
                  const pos = positions[ev.id] ?? { col: 0, cols: 1 };
                  const leftPercent = (pos.col / pos.cols) * 100;
                  const widthPercent = 100 / pos.cols;
                  const top = minutesToPx(start);
                  const height = minutesToPx(duration);
                  
                  // Calculate minimum height for text to fit
                  const minHeight = 36; // Minimum height in pixels for readable text

                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                      className="group absolute rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        minHeight: `${minHeight}px`,
                        left: `calc(${leftPercent}% + 2px)`,
                        width: `calc(${widthPercent}% - 4px)`,
                        background: ev.color ?? "#BFDBFE",
                        border: "1px solid rgba(0,0,0,0.06)",
                        zIndex: 10,
                      }}
                      title={`${ev.title}\n${ev.description ?? ""}\n${ev.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${ev.endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\nClick to edit, X to delete`}
                      data-event-id={ev.id}
                    >
                      <div className="flex flex-col h-full px-2 py-1.5 overflow-hidden">
                        <div className="font-semibold text-white text-sm leading-snug pr-6 flex-shrink-0" 
                             style={{ 
                               textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                               overflow: 'hidden',
                               textOverflow: 'ellipsis',
                               whiteSpace: height < 50 ? 'nowrap' : 'normal',
                               display: height >= 50 ? '-webkit-box' : 'block',
                               WebkitLineClamp: height >= 50 ? 2 : undefined,
                               WebkitBoxOrient: height >= 50 ? 'vertical' as const : undefined
                             } as React.CSSProperties}>
                          {ev.title}
                        </div>
                        {height >= 60 && (
                          <div className="text-xs text-white/90 mt-1 leading-snug flex-shrink-0" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                            {ev.startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${ev.title}"?`)) {
                            onDeleteEvent(ev.id);
                          }
                        }}
                        className="absolute right-0 top-0 bottom-0 w-6 opacity-0 group-hover:opacity-100 bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center rounded-r-md transition-opacity text-sm font-bold"
                        title="Delete event"
                        aria-label={`Delete ${ev.title}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {/* drag selection ghost */}
                {dragState && dragState.active && dragState.dayIndex === idx && (
                  <div
                    className="absolute left-2 right-2 rounded-md bg-blue-400/30 border-2 border-blue-500/50 z-20 pointer-events-none"
                    style={{ top: dragState.topPx, height: dragState.heightPx }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
