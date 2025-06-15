/**
 * Date utilities - Replace moment.js cu funcții native
 * Reduce bundle size și improve performance
 */

// Format date pentru display
export const formatDate = (date, format = 'DD.MM.YYYY') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return `${day}.${month}.${year}`;
  }
};

// Get today's date în format YYYY-MM-DD
export const getTodayString = () => {
  const today = new Date();
  return formatDate(today, 'YYYY-MM-DD');
};

// Format pentru API calls (ISO string)
export const formatDateForAPI = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  // Setăm ora la 00:00:00.000Z pentru consistency
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

// Parse date string în Date object
export const parseDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Check dacă o dată este astăzi
export const isToday = (date) => {
  if (!date) return false;

  const d = new Date(date);
  const today = new Date();

  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

// Get relative date (yesterday, today, tomorrow)
export const getRelativeDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  if (isSameDay(d, tomorrow)) return 'Tomorrow';

  return formatDate(d);
};

// Helper pentru compararea zilelor
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Validate date string
export const isValidDate = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Get start of day pentru consistență cu timezone
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of day
export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
