package app.shareek.prayfirst;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Alarms are cleared by a reboot, an app update or a clock/timezone change; set them again. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        PrayFirstScheduler.scheduleNext(context);
    }
}
