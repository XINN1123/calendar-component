import { useState } from "react";

export const useCalendar = (initialDate: Date = new Date()) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const goToPrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const setDate = (date: Date) => setSelectedDate(date);

  return { selectedDate, goToNextMonth, goToPrevMonth, setDate };
};
