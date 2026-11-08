package app.shareek.prayfirst;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.graphics.drawable.Icon;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;

import java.io.IOException;

/**
 * Plays the adhan from res/raw/adhan.* while showing a notification with a
 * Stop button. If no recording is bundled the receiver never starts this
 * service, so a missing file is harmless.
 */
public class AdhanService extends Service {

    static final String ACTION_STOP = "app.shareek.prayfirst.STOP_ADHAN";
    private static final String EXTRA_KEY = "key";
    private static final int NOTIFICATION_ID = 77;

    private MediaPlayer player;

    static int adhanResource(Context c) {
        return c.getResources().getIdentifier("adhan", "raw", c.getPackageName());
    }

    static boolean hasAdhanFile(Context c) {
        return adhanResource(c) != 0;
    }

    static void start(Context c, String key) {
        Intent i = new Intent(c, AdhanService.class);
        i.putExtra(EXTRA_KEY, key);
        if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i);
        else c.startService(i);
    }

    static void stop(Context c) {
        Intent i = new Intent(c, AdhanService.class);
        i.setAction(ACTION_STOP);
        c.startService(i);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            release();
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }

        String key = intent != null ? intent.getStringExtra(EXTRA_KEY) : null;
        String title = (key == null || "test".equals(key))
                ? "Adhan"
                : "Adhan · " + PrayFirstStore.label(key);

        Notif.ensureChannels(this);
        Intent stopIntent = new Intent(this, AdhanService.class).setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(
                this, 12, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = Notif.builder(this, Notif.CHANNEL_ADHAN)
                .setSmallIcon(R.drawable.ic_stat_prayer)
                .setContentTitle(title)
                .setContentText("Tap Stop to silence")
                .setContentIntent(Notif.openApp(this))
                .addAction(new Notification.Action.Builder(
                        Icon.createWithResource(this, R.drawable.ic_stat_prayer), "Stop", stopPi).build())
                .setOngoing(true)
                .build();

        // Must be called promptly after startForegroundService().
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(NOTIFICATION_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, n);
        }

        if (!play()) {
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }
        return START_NOT_STICKY;
    }

    private boolean play() {
        release();
        int res = adhanResource(this);
        if (res == 0) return false;
        try (AssetFileDescriptor afd = getResources().openRawResourceFd(res)) {
            if (afd == null) return false;
            MediaPlayer mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build());
            mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            mp.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer m) {
                    release();
                    stopForeground(true);
                    stopSelf();
                }
            });
            mp.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                @Override
                public boolean onError(MediaPlayer m, int what, int extra) {
                    release();
                    stopForeground(true);
                    stopSelf();
                    return true;
                }
            });
            mp.prepare();
            mp.start();
            player = mp;
            return true;
        } catch (IOException | RuntimeException e) {
            return false;
        }
    }

    private void release() {
        if (player != null) {
            try {
                player.release();
            } catch (RuntimeException ignored) {
                // Already released.
            }
            player = null;
        }
    }

    @Override
    public void onDestroy() {
        release();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
