export const getMonthMatrix = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();

  const matrix: Date[][] = [];
  let currentDate = new Date(year, month, 1 - startDay);

  for (let week = 0; week < 6; week++) {
    const weekRow: Date[] = [];
    for (let day = 0; day < 7; day++) {
      weekRow.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    matrix.push(weekRow);
  }
  return matrix;
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getWeekRange = (date: Date): [Date, Date] => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [start, end];
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
