/**
 * Practice reminders — ported from the original `retention.js`.
 */

export interface ReminderOption {
  id: string;
  label: string;
  time: string; // HH:MM (local)
}

export const reminderOptions: ReminderOption[] = [
  { id: 'morning', label: 'Morning', time: '08:00' },
  { id: 'evening', label: 'Evening', time: '19:00' },
  { id: 'night', label: 'Night', time: '21:30' },
];

export interface Reminder {
  enabled: boolean;
  optionId: string;
  channel: 'push' | 'whatsapp' | 'sms';
}

export const defaultReminder: Reminder = { enabled: true, optionId: 'evening', channel: 'push' };

export function getReminderOption(id: string): ReminderOption {
  return reminderOptions.find((o) => o.id === id) ?? reminderOptions[1]!;
}

export function getReminderMessage(name: string, reminder: Reminder): string {
  const option = getReminderOption(reminder.optionId);
  const who = name.trim() || 'there';
  return `Hi ${who}! It's ${option.label.toLowerCase()} — time for your 5-minute English practice. 🎤`;
}
