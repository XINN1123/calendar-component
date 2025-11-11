# 🗓️ React Calendar Component

### Submitted by:
**CH. Luwanglemba Singh**  
🎓 SRM Sikkim University — Department of Computer Science  
📅 Graduation: May 2026  
📧 Email: luwanglembasignh7317@gmail.com  

---

## 📘 Project Overview

This project is a **responsive and interactive Calendar Component** built with **React, TypeScript, TailwindCSS, and Storybook**.  
It satisfies all the assignment criteria for event management, responsiveness, and accessibility.

---

## 🧩 Core Features

| Feature | Description |
|----------|--------------|
| **Month View** | 6×7 grid (42 cells) showing full month, with adjacent month days grayed out |
| **Week View** | 7-day horizontal layout with hourly slots |
| **Event Management** | Add, Edit, and Delete events using a clean modal interface |
| **Date Navigation** | Navigate using Prev/Next buttons, Today shortcut, and Month-Year picker |
| **Touch Support** | Swipe left/right on mobile to move between weeks/months |
| **Accessibility** | Keyboard navigation (Tab, Enter, Arrow Keys) and ARIA support |
| **Responsive Design** | Fully responsive layout for mobile, tablet, and desktop |

---

## ⚙️ Technologies Used

| Technology | Purpose |
|-------------|----------|
| **React (TypeScript)** | UI components and logic |
| **TailwindCSS** | Styling and responsive layout |
| **Storybook** | Component documentation and testing |
| **Vite** | Fast build and development tool |
| **ESLint + Prettier** | Code quality and formatting |

---

## 🧠 Implementation Details

- **CalendarView**: Core component controlling Month/Week views, navigation, and modals.  
- **MonthView**: Renders full month grid (42 cells).  
- **WeekView**: Displays 7-day horizontal layout with hourly intervals.  
- **EventModal**: Handles adding/editing/deleting events.  
- **useCalendar Hook**: Manages date navigation.  
- **useEventManager Hook**: Handles event CRUD logic.  
- **Swipe Gestures**: Implemented via touch listeners for mobile devices.

---

## 📅 Responsiveness

| Breakpoint | Device Type | Layout Behavior |
|-------------|--------------|-----------------|
| **sm (≥640px)** | Large Mobile | Stacked grid, touch navigation |
| **md (≥768px)** | Tablet | Compact 2-column view |
| **lg (≥1024px)** | Desktop | Full grid with navigation |
| **xl (≥1280px)** | Large Desktop | Expanded layout with spacing |

---

## ♿ Accessibility (WCAG 2.1 AA)

- Supports full **keyboard navigation**  
- Uses **semantic HTML** for screen readers  
- Maintains proper **color contrast ratios**

---

## 🧪 Testing (Storybook)

Includes two stories for component preview and interaction testing:
- **Default Calendar** (with sample events)
- **Empty Calendar**

Run Storybook:
```bash
npm run storybook
