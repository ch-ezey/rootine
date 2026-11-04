import { CalendarClock, Check, CircleDot, Repeat } from "lucide-react";

/** Display label and icon for each API task type. */
export const TASK_TYPES = {
  routine: { label: "Routine", icon: Repeat },
  habit: { label: "Habit", icon: CircleDot },
  one_time: { label: "One-time", icon: Check },
  event: { label: "Event", icon: CalendarClock },
};
