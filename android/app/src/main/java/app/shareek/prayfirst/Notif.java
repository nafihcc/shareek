package app.shareek.prayfirst;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/** Notification channels and the prayer-time notification. */
final class Notif {

    static final String CHANNEL_PRAYER = "prayer_time";
    static final String CHANNEL_ADHAN = "adhan_playing";

    private Notif() {}

    static void ensureChannels(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        NotificationChannel prayer = new NotificationChannel(
                CHANNEL_PRAYER, "Prayer times", NotificationManager.IMPORTANCE_HIGH);
        prayer.setDescription("Alerts when a prayer time begins");
        nm.createNotificationChannel(prayer);
        NotificationChannel adhan = new NotificationChannel(
                CHANNEL_ADHAN, "Adhan", NotificationManager.IMPORTANCE_LOW);
        adhan.setDescription("Shown while the adhan is playing");
        nm.createNotificationChannel(adhan);
    }

    static Notification.Builder builder(Context c, String channel) {
        if (Build.VERSION.SDK_INT >= 26) return new Notification.Builder(c, channel);
        return new Notification.Builder(c);
    }

    static PendingIntent openApp(Context c) {
        Intent open = new Intent(c, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(
                c, 10, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** "It's time for Dhuhr" — mentions the pause only when apps will actually be paused. */
    static void postPrayerTime(Context c, String key, boolean paused, int minutes) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null || !nm.areNotificationsEnabled()) return;
        ensureChannels(c);
        String label = PrayFirstStore.label(key);
        String text = paused
                ? "Your chosen apps are paused for " + minutes + " minutes. Pray first."
                : "It's time to pray.";
        Notification n = builder(c, CHANNEL_PRAYER)
                .setSmallIcon(R.drawable.ic_stat_prayer)
                .setContentTitle("It's time for " + label)
                .setContentText(text)
                .setContentIntent(openApp(c))
                .setAutoCancel(true)
                .setCategory(Notification.CATEGORY_REMINDER)
                .build();
        nm.notify(100 + Math.abs(key.hashCode() % 50), n);
    }

    /** Shown when the stored schedule has run out, so alerts don't silently stop. */
    static void postRefreshNeeded(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null || !nm.areNotificationsEnabled()) return;
        ensureChannels(c);
        Notification n = builder(c, CHANNEL_PRAYER)
                .setSmallIcon(R.drawable.ic_stat_prayer)
                .setContentTitle("Open Shareek to keep prayer alerts going")
                .setContentText("Your upcoming prayer times need refreshing.")
                .setContentIntent(openApp(c))
                .setAutoCancel(true)
                .build();
        nm.notify(199, n);
    }
}
