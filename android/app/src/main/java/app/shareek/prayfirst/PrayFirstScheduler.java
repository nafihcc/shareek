package app.shareek.prayfirst;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

import java.util.List;

/**
 * Keeps exactly one alarm pending: the next prayer time. When it fires, the
 * receiver handles that prayer and calls {@link #scheduleNext} again.
 *
 * setAlarmClock is used because it is exact, survives Doze, and needs no
 * special permission. Android shows a small alarm icon while one is pending.
 */
final class PrayFirstScheduler {

    private static final int REQUEST_CODE = 4242;

    private PrayFirstScheduler() {}

    private static PendingIntent alarmIntent(Context c, String key, long at) {
        Intent i = new Intent(c, PrayerAlarmReceiver.class);
        i.putExtra(PrayerAlarmReceiver.EXTRA_KEY, key);
        i.putExtra(PrayerAlarmReceiver.EXTRA_AT, at);
        return PendingIntent.getBroadcast(
                c, REQUEST_CODE, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** @return true if an alarm was set, false if there is nothing upcoming (or Pray First is off). */
    static boolean scheduleNext(Context c) {
        Context app = c.getApplicationContext();
        AlarmManager am = app.getSystemService(AlarmManager.class);
        if (am == null) return false;

        // Cancel whatever was pending (the extras do not affect matching).
        am.cancel(alarmIntent(app, "x", 0L));

        PrayFirstStore.Config cfg = PrayFirstStore.loadConfig(app);
        if (!cfg.enabled) return false;

        long now = System.currentTimeMillis();
        List<PrayFirstStore.Entry> schedule = PrayFirstStore.loadSchedule(app);
        for (PrayFirstStore.Entry e : schedule) {
            if (e.at <= now + 1000L) continue;
            Intent show = new Intent(app, MainActivity.class);
            PendingIntent showPi = PendingIntent.getActivity(
                    app, 11, show, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            am.setAlarmClock(new AlarmManager.AlarmClockInfo(e.at, showPi), alarmIntent(app, e.key, e.at));
            return true;
        }
        return false;
    }
}
