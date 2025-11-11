import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CalendarView from "./CalendarView";
import type { CalendarEvent } from "./CalendarView.types";

/**
 * 📘 Storybook Interactive Wrapper
 * Keeps local event state so you can add, edit, and delete events directly
 * inside Storybook preview.
 */
const CalendarWrapper: React.FC<{ events: CalendarEvent[] }> = ({ events: initialEvents }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents ?? []);

  // ➕ Add
  const handleAdd = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  // 🖊️ Update
  const handleUpdate = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  // ❌ Delete
  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CalendarView
        events={events}
        onEventAdd={handleAdd}
        onEventUpdate={handleUpdate}
        onEventDelete={handleDelete}
        initialView="month"
      />
    </div>
  );
};


/* Storybook Meta Configuration */
/* -------------------------------------------------------------------------- */
const meta: Meta<typeof CalendarWrapper> = {
  title: "Components/Calendar/CalendarView",
  component: CalendarWrapper,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "An interactive, responsive calendar with Month/Week views, event management, and mobile-friendly gestures.",
      },
    },
  },
  argTypes: {
    events: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarWrapper>
/* Sample Event Data  */

const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    description: "Daily sync-up with development team.",
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
    color: "#3B82F6", // Tailwind Blue-500
    category: "Work",
  },
  {
    id: "2",
    title: "Doctor Appointment",
    description: "Routine health check-up at 3:00 PM",
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    color: "#10B981", // Green
    category: "Personal",
  },
  {
    id: "3",
    title: "Project Deadline",
    description: "Finalize and submit project deliverables.",
    startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: "#F97316", // Orange
    category: "Work",
  },
];

/*  Story Variants  */


export const Default: Story = {
  args: { events: sampleEvents },
};

export const EmptyCalendar: Story = {
  args: { events: [] },
};

export const WeekView: Story = {
  args: { events: sampleEvents },
  render: (args) => (
    <CalendarWrapper {...args} events={sampleEvents} />
  ),
};
