package app.shareek.prayfirst;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.Service;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;

/**
 * Runs while a prayer lock is open. A foreground service keeps the app's
 * process alive, so clearing Shareek from the recent-apps list (or the phone
 * trimming background apps) does not take the lock down with it. It also
 * warns the user if the accessibility service has been switched off, and
 * stops itself as soon as the lock ends.
 */
public class LockGuardService extends Service {

    private static final int NOTIF_ID = 301;
    private static final int WARN_ID = 302;
    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable check = new Runnable() {
        @Override
        public void run() {
            if (!PrayFirstStore.isBlockingNow(LockGuardService.this)) {
                stopForeground(true);
                stopSelf();
                return;
            }
            warnIfServiceOff();
            handler.postDelayed(this, 15_000L);
        }
    };

    /** Start if a lock is open; harmless otherwise. */
    static void startIfNeeded(Context c) {
        try {
            if (!PrayFirstStore.isBlockingNow(c)) return;
            Intent i = new Intent(c, LockGuardService.class);
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i);
            else c.startService(i);
        } catch (RuntimeException ignored) {
            // The accessibility service still blocks while the process lives.
        }
    }

    static boolean accessibilityOn(Context c) {
        try {
            String enabled = Settings.Secure.getString(
                    c.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (enabled == null) return false;
            String me = new ComponentName(c, AppBlockerService.class).flattenToString();
            String meShort = new ComponentName(c, AppBlockerService.class).flattenToShortString();
            return enabled.contains(me) || enabled.contains(meShort);
        } catch (RuntimeException e) {
            return true;
        }
    }

    private void warnIfServiceOff() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null) return;
        if (accessibilityOn(this)) {
            nm.cancel(WARN_ID);
            return;
        }
        Intent settings = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        Notification n = Notif.builder(this, Notif.CHANNEL_PRAYER)
                .setSmallIcon(R.drawable.ic_stat_prayer)
                .setContentTitle("Pray First lock is off")
                .setContentText("Tap to turn “Shareek Pray First” back on in Accessibility.")
                .setContentIntent(android.app.PendingIntent.getActivity(
                        this, 12, settings,
                        android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE))
                .setAutoCancel(true)
                .build();
        nm.notify(WARN_ID, n);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Notif.ensureChannels(this);
        Notification n = Notif.builder(this, Notif.CHANNEL_ADHAN)
                .setSmallIcon(R.drawable.ic_stat_prayer)
                .setContentTitle("Pray first")
                .setContentText("Your chosen apps are locked. Open Shareek to finish.")
                .setContentIntent(Notif.openApp(this))
                .setOngoing(true)
                .build();
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                startForeground(NOTIF_ID, n);
            }
        } catch (RuntimeException e) {
            stopSelf();
            return START_NOT_STICKY;
        }
        handler.removeCallbacks(check);
        handler.post(check);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(check);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
