package app.shareek.prayfirst;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Fires at each prayer time: notify, optionally play the adhan, then arm the next alarm. */
public class PrayerAlarmReceiver extends BroadcastReceiver {

    static final String EXTRA_KEY = "key";
    static final String EXTRA_AT = "at";

    @Override
    public void onReceive(Context context, Intent intent) {
        String key = intent.getStringExtra(EXTRA_KEY);
        PrayFirstStore.Config cfg = PrayFirstStore.loadConfig(context);

        if (cfg.enabled && key != null) {
            boolean paused = cfg.blockFor(key) && !cfg.blocked.isEmpty();
            Notif.postPrayerTime(context, key, paused, cfg.blockMinutes);

            if (cfg.adhanFor(key) && AdhanService.hasAdhanFile(context)) {
                try {
                    AdhanService.start(context, key);
                } catch (RuntimeException ignored) {
                    // If the system refuses a foreground service, the notification above still shows.
                }
            }
        }

        // Keep the lock alive even if the app is cleared from recents.
        LockGuardService.startIfNeeded(context);

        // Chain to the next prayer. If none is left, ask the user to open the app.
        boolean armed = PrayFirstScheduler.scheduleNext(context);
        if (!armed && cfg.enabled) {
            Notif.postRefreshNeeded(context);
        }
    }
}
