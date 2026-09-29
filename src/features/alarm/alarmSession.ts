/**
 * Whether the alarm screen is currently open, so a nag notification that
 * fires mid-session doesn't stack a second alarm screen on top.
 */
let active = false;

export const alarmSession = {
  isActive: () => active,
  setActive: (value: boolean) => {
    active = value;
  },
};
