package app.shareek.prayfirst;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Build;
import android.provider.Settings;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Exposed to the website as `window.ShareekNative`. Everything here is either
 * a read of simple device state or a setting the user chose on the Pray First
 * page. The site is served from inside the APK and external links open in the
 * browser, so only Shareek's own pages can reach this object.
 */
public class NativeBridge {

    static final int REQ_NOTIFICATIONS = 31;

    private final Activity activity;

    NativeBridge(Activity activity) {
        this.activity = activity;
    }

    private Context ctx() {
        return activity.getApplicationContext();
    }

    private void launch(Intent intent) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            activity.startActivity(intent);
        } catch (RuntimeException ignored) {
            // No screen to handle it on this device.
        }
    }

    // ── Reading state ──────────────────────────────────────────────────

    /** Launchable apps (excluding Shareek), as JSON: [{"pkg":"…","label":"…"}]. */
    @JavascriptInterface
    public String getInstalledApps() {
        PackageManager pm = activity.getPackageManager();
        Intent main = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> found = pm.queryIntentActivities(main, 0);

        final List<String[]> rows = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (ResolveInfo ri : found) {
            String pkg = ri.activityInfo.packageName;
            if (pkg.equals(activity.getPackageName()) || !seen.add(pkg)) continue;
            rows.add(new String[] {pkg, String.valueOf(ri.loadLabel(pm))});
        }
        Collections.sort(rows, new Comparator<String[]>() {
            @Override
            public int compare(String[] a, String[] b) {
                return a[1].compareToIgnoreCase(b[1]);
            }
        });

        JSONArray out = new JSONArray();
        try {
            for (String[] r : rows) {
                out.put(new JSONObject().put("pkg", r[0]).put("label", r[1]));
            }
        } catch (JSONException ignored) {
            // Keys are fixed strings; this cannot happen.
        }
        return out.toString();
    }

    @JavascriptInterface
    public String getStatus() {
        JSONObject o = new JSONObject();
        try {
            o.put("accessibilityEnabled", isBlockerEnabled());
            NotificationManager nm = ctx().getSystemService(NotificationManager.class);
            o.put("notificationsAllowed", nm != null && nm.areNotificationsEnabled());
            o.put("blockingNow", PrayFirstStore.isBlockingNow(ctx()));
            o.put("adhanFile", AdhanService.hasAdhanFile(ctx()));
        } catch (JSONException ignored) {
            // Keys are fixed strings; this cannot happen.
        }
        return o.toString();
    }

    private boolean isBlockerEnabled() {
        String enabled = Settings.Secure.getString(
                ctx().getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (enabled == null) return false;
        ComponentName me = new ComponentName(ctx(), AppBlockerService.class);
        String lower = enabled.toLowerCase(Locale.ROOT);
        return lower.contains(me.flattenToString().toLowerCase(Locale.ROOT))
                || lower.contains(me.flattenToShortString().toLowerCase(Locale.ROOT));
    }

    // ── Saving settings from the website ───────────────────────────────

    @JavascriptInterface
    public void saveConfig(String json) {
        if (json == null) return;
        PrayFirstStore.saveConfig(ctx(), json);
        PrayFirstScheduler.scheduleNext(ctx());
    }

    @JavascriptInterface
    public void saveSchedule(String json) {
        if (json == null) return;
        PrayFirstStore.saveSchedule(ctx(), json);
        PrayFirstScheduler.scheduleNext(ctx());
    }

    // ── Setup helpers ──────────────────────────────────────────────────

    @JavascriptInterface
    public void openAccessibilitySettings() {
        launch(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
    }

    @JavascriptInterface
    public void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33
                && activity.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    activity.requestPermissions(
                            new String[] {android.Manifest.permission.POST_NOTIFICATIONS},
                            REQ_NOTIFICATIONS);
                }
            });
            return;
        }
        // Already asked (or turned off in settings): send the user to the switch.
        Intent i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
        i.putExtra(Settings.EXTRA_APP_PACKAGE, ctx().getPackageName());
        launch(i);
    }

    @JavascriptInterface
    public void openBatterySettings() {
        launch(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
    }

    // ── Testing ────────────────────────────────────────────────────────

    @JavascriptInterface
    public void startTestWindow(int minutes) {
        PrayFirstStore.startTestWindow(ctx(), minutes);
    }

    @JavascriptInterface
    public void testAdhan() {
        if (!AdhanService.hasAdhanFile(ctx())) return;
        try {
            AdhanService.start(ctx(), "test");
        } catch (RuntimeException ignored) {
            // The system may refuse a foreground service in rare states.
        }
    }

    @JavascriptInterface
    public void stopAdhan() {
        AdhanService.stop(ctx());
    }
}
