import React, { useState } from "react";
import type { CalendarEvent } from "./CalendarView.types";
import { generateId } from "../../utils/event.utils";

interface EventModalProps {
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  initialData?: CalendarEvent | null;
}

const colors = ["#3B82F6", "#10B981", "#F97316", "#EF4444", "#8B5CF6"];

const EventModal: React.FC<EventModalProps> = ({ onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [startDateStr, setStartDateStr] = useState(
    initialData ? initialData.startDate.toISOString().slice(0,16) : new Date().toISOString().slice(0,16)
  );
  const [endDateStr, setEndDateStr] = useState(
    initialData ? initialData.endDate.toISOString().slice(0,16) : new Date(Date.now() + 3600_000).toISOString().slice(0,16)
  );
  const [color, setColor] = useState(initialData?.color ?? colors[0]);
  const [category, setCategory] = useState(initialData?.category ?? "General");

  const handleSave = () => {
    if (!title.trim()) { alert("Title required"); return; }
    const event: CalendarEvent = {
      id: initialData?.id ?? generateId(),
      title: title.trim(),
      description,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      color,
      category,
    };
    onSave(event);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white p-5 rounded-xl w-[400px] max-sm:w-[90%] shadow-lg my-8 relative">
        <h2 className="text-lg font-semibold mb-4 text-center">{initialData ? "Edit Event" : "Add Event"}</h2>

        <div className="space-y-3">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="w-full border rounded-md p-2 text-sm" maxLength={100} />
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="w-full border rounded-md p-2 text-sm h-20" maxLength={500} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Start</label>
              <input 
                type="datetime-local" 
                value={startDateStr} 
                onChange={(e)=>setStartDateStr(e.target.value)} 
                className="w-full border rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">End</label>
              <input 
                type="datetime-local" 
                value={endDateStr} 
                onChange={(e)=>setEndDateStr(e.target.value)} 
                className="w-full border rounded-md p-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {colors.map(c => (
              <button key={c} onClick={()=>setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color===c ? "border-black" : "border-transparent"}`} style={{ backgroundColor: c }} />
            ))}
          </div>

          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border rounded-md p-2 text-sm">
            <option>General</option>
            <option>Work</option>
            <option>Personal</option>
            <option>Study</option>
            <option>Other</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
