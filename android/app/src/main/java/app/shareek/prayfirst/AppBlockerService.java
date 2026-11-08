package app.shareek.prayfirst;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.os.SystemClock;
import android.view.accessibility.AccessibilityEvent;

/**
 * Watches for a different app coming to the front. If it is one the user chose
 * to pause, and a prayer window is open, it sends the phone to the home screen
 * and shows the "Pray first" screen.
 *
 * Privacy: the service is configured with canRetrieveWindowContent=false and
 * only window-change events, so all it ever receives is the app's package name.
 */
public class AppBlockerService extends AccessibilityService {

    private long lastBlockAt = 0L;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return;
        }
        CharSequence name = event.getPackageName();
        if (name == null) return;
        String pkg = name.toString();

        // Never block ourselves (that would trap the user on the pause screen).
        if (pkg.equals(getPackageName())) return;

        PrayFirstStore.Config cfg = PrayFirstStore.loadConfig(this);
        if (!cfg.blocked.contains(pkg)) return;
        if (!PrayFirstStore.isBlockingNow(this)) return;

        // One window change can raise several events; react once.
        long now = SystemClock.elapsedRealtime();
        if (now - lastBlockAt < 800L) return;
        lastBlockAt = now;

        performGlobalAction(GLOBAL_ACTION_HOME);

        Intent block = new Intent(this, BlockActivity.class);
        block.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        block.putExtra(BlockActivity.EXTRA_PACKAGE, pkg);
        try {
            startActivity(block);
        } catch (RuntimeException ignored) {
            // If the system refuses, the user has still been sent home.
        }
    }

    @Override
    public void onInterrupt() {
        // Nothing to clean up.
    }
}
