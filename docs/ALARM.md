# The wake-up alarm

## What it does

1. In **Learning → Alarm** the user picks a time and weekdays.
2. At that time a notification rings with the app's own alarm sound
   (`assets/sounds/alarm.wav`). It keeps "nagging" every minute for five
   minutes.
3. Tapping it — or the app being open when it fires — opens `/alarm`: a
   full-screen session with no back button (Android's hardware back is
   blocked too). The alarm tone loops in-app until the first move.
4. The scheduler (`src/domain/scheduler.ts`) picks the opening per the
   learning mode, and inside it the first line that isn't mastered:
   **Level 1** if it has never been completed, otherwise **Level 2**.
5. Reaching the end of the line switches the alarm off: pending nags for
   today are cancelled, shown notifications are dismissed and the result
   counts towards stars like any other session.

If nothing is flagged "Learning", the alarm picks from the whole catalogue.
If everything flagged is mastered, the alarm congratulates the user and sends
them to pick a new opening.

## How it's built

| Piece                         | File                                       |
| ----------------------------- | ------------------------------------------ |
| Timing maths (pure, tested)   | `src/domain/alarmSchedule.ts`              |
| Notification scheduling       | `src/features/alarm/alarmService.ts`       |
| Web stub (feature hidden)     | `src/features/alarm/alarmService.web.ts`   |
| Notification → screen routing | `src/features/alarm/useAlarmRouting.ts`    |
| Settings UI                   | `src/features/alarm/AlarmSettingsCard.tsx` |
| Session screen                | `src/app/alarm.tsx`                        |

- The main alarm is one **weekly repeating** notification per weekday, so it
  keeps working even if the app is never opened.
- Nags are one-shot **date** notifications for the next seven days, rebuilt
  whenever settings change or an alarm is solved (which is how a solved
  alarm stops nagging). iOS allows 64 pending notifications; the worst case
  here is 7 + 7 × 5 = 42.
- Android uses a dedicated channel (`wake-up-alarm`) with MAX importance,
  alarm audio usage and DND bypass (the user may still need to allow it).

## Platform limits (and the upgrade path)

A notification is not a true alarm clock:

- **iOS** won't play a notification sound when the phone is on silent or in a
  Focus that doesn't allow the app, and it can't launch the app by itself.
  _Upgrade:_ iOS 26+ **AlarmKit** gives third-party apps real alarms that
  break through silent mode and Focus. It needs a small native module
  (Expo Modules API) + config plugin.
- **Android** can show a full-screen alarm activity over the lock screen with
  `USE_FULL_SCREEN_INTENT` and an exact `AlarmManager` alarm. _Upgrade:_ a
  native module that schedules `setAlarmClock()` and launches the app's
  `/alarm` route.
- **Web** can't wake a sleeping device at all, so the feature is hidden and
  the landing page promotes the mobile app.

The rest of the app is already structured for this: only
`alarmService.ts` would change.

## Testing it

Notifications need a **development build** (Expo Go doesn't bundle custom
notification sounds):

```bash
npx expo run:ios      # or run:android, or: npx eas-cli build --profile development
```

Then in the app: Learning → Alarm → **Test the alarm** (rings in 5 s — lock
the phone first to see the real experience).
