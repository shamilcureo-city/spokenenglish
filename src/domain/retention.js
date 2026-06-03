export const reminderOptions = [
  { id: 'morning', label: 'Morning', time: '07:30' },
  { id: 'evening', label: 'Evening', time: '19:30' },
  { id: 'night', label: 'Night', time: '21:30' },
];

export const defaultReminder = {
  enabled: true,
  optionId: 'evening',
  channel: 'App notification',
};

export const getReminderMessage = (profile, reminder = defaultReminder) => {
  const option = reminderOptions.find((item) => item.id === reminder.optionId) ?? reminderOptions[1];
  return `${profile.name}, your ${option.label.toLowerCase()} 30-minute English speaking practice is scheduled for ${option.time}.`;
};
