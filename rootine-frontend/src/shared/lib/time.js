/** Helpers for task times. The API sends start times as "HH:mm:ss" (time of day only). */

export const toMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

export const formatTime = (time) => {
  const minutes = toMinutes(time);
  if (minutes == null) return "";
  return minutesToLabel(minutes);
};

export const minutesToLabel = (minutes) => {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60) % 24, minutes % 60, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export const formatDuration = (minutes) => {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
};

/** "HH:mm:ss" → "HH:mm" for <input type="time"> */
export const toInputTime = (time) => (time ? time.slice(0, 5) : "");

export const nowMinutes = (date = new Date()) => date.getHours() * 60 + date.getMinutes();

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/** Total planned minutes across tasks that have a duration. */
export const totalDuration = (tasks) => tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
