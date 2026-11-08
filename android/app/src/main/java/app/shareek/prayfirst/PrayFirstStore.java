package app.shareek.prayfirst;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Settings and prayer schedule sent from the website, plus the single question
 * the blocker keeps asking: "are apps paused right now?".
 *
 * The answer is worked out from the stored schedule on every call, so blocking
 * does not depend on an alarm having fired on time.
 */
public final class PrayFirstStore {

    private static final String PREFS = "pray_first";
    private static final String K_CONFIG = "config";
    private static final String K_SCHEDULE = "schedule";
    private static final String K_BYPASS_UNTIL = "bypassUntil";
    private static final String K_TEST_UNTIL = "testUntil";

    public static final long EMERGENCY_MS = 5 * 60_000L;

    public static final class Entry {
        public final String key;
        public final long at;

        Entry(String key, long at) {
            this.key = key;
            this.at = at;
        }
    }

    public static final class Config {
        public boolean enabled = false;
        public int blockMinutes = 20;
        public boolean strict = false;
        public final Set<String> blocked = new HashSet<>();
        private final Map<String, Boolean> adhan = new HashMap<>();
        private final Map<String, Boolean> block = new HashMap<>();

        public boolean adhanFor(String key) {
            Boolean v = adhan.get(key);
            return v == null || v;
        }

        public boolean blockFor(String key) {
            Boolean v = block.get(key);
            return v == null || v;
        }
    }

    // Parsed copies kept in memory: the accessibility service asks on every window change.
    private static Config cachedConfig;
    private static List<Entry> cachedSchedule;

    private PrayFirstStore() {}

    private static SharedPreferences prefs(Context c) {
        return c.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    // ── Saving (called from the web bridge) ────────────────────────────

    public static synchronized void saveConfig(Context c, String json) {
        prefs(c).edit().putString(K_CONFIG, json).apply();
        cachedConfig = null;
    }

    public static synchronized void saveSchedule(Context c, String json) {
        prefs(c).edit().putString(K_SCHEDULE, json).apply();
        cachedSchedule = null;
    }

    // ── Loading ────────────────────────────────────────────────────────

    public static synchronized Config loadConfig(Context c) {
        if (cachedConfig != null) return cachedConfig;
        Config cfg = new Config();
        String raw = prefs(c).getString(K_CONFIG, null);
        if (raw != null) {
            try {
                JSONObject o = new JSONObject(raw);
                cfg.enabled = o.optBoolean("enabled", false);
                int minutes = o.optInt("blockMinutes", 20);
                cfg.blockMinutes = (minutes >= 1 && minutes <= 180) ? minutes : 20;
                cfg.strict = o.optBoolean("strict", false);

                JSONArray pk = o.optJSONArray("blockedPackages");
                if (pk != null) {
                    for (int i = 0; i < pk.length(); i++) {
                        String p = pk.optString(i, "");
                        if (!p.isEmpty()) cfg.blocked.add(p);
                    }
                }
                JSONObject prayers = o.optJSONObject("prayers");
                if (prayers != null) {
                    Iterator<String> it = prayers.keys();
                    while (it.hasNext()) {
                        String key = it.next();
                        JSONObject p = prayers.optJSONObject(key);
                        if (p != null) {
                            cfg.adhan.put(key, p.optBoolean("adhan", true));
                            cfg.block.put(key, p.optBoolean("block", true));
                        }
                    }
                }
            } catch (JSONException ignored) {
                // Fall through with defaults.
            }
        }
        cachedConfig = cfg;
        return cfg;
    }

    public static synchronized List<Entry> loadSchedule(Context c) {
        if (cachedSchedule != null) return cachedSchedule;
        List<Entry> list = new ArrayList<>();
        String raw = prefs(c).getString(K_SCHEDULE, null);
        if (raw != null) {
            try {
                JSONArray arr = new JSONArray(raw);
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject o = arr.optJSONObject(i);
                    if (o == null) continue;
                    String key = o.optString("key", "");
                    long at = o.optLong("at", 0L);
                    if (!key.isEmpty() && at > 0) list.add(new Entry(key, at));
                }
            } catch (JSONException ignored) {
                // Ignore a corrupted schedule; the website will send a fresh one.
            }
        }
        Collections.sort(list, new Comparator<Entry>() {
            @Override
            public int compare(Entry a, Entry b) {
                return Long.compare(a.at, b.at);
            }
        });
        cachedSchedule = list;
        return list;
    }

    // ── Emergency access and test window ───────────────────────────────

    public static void grantEmergency(Context c) {
        prefs(c).edit().putLong(K_BYPASS_UNTIL, System.currentTimeMillis() + EMERGENCY_MS).apply();
    }

    public static void startTestWindow(Context c, int minutes) {
        long until = System.currentTimeMillis() + Math.max(1, minutes) * 60_000L;
        prefs(c).edit().putLong(K_TEST_UNTIL, until).apply();
    }

    // ── The question the blocker asks ──────────────────────────────────

    /** The prayer whose window is open right now, or null. */
    public static Entry activeEntry(Context c) {
        Config cfg = loadConfig(c);
        if (!cfg.enabled) return null;
        long now = System.currentTimeMillis();
        long span = cfg.blockMinutes * 60_000L;
        Entry found = null;
        for (Entry e : loadSchedule(c)) {
            if (e.at > now) break;
            if (now < e.at + span && cfg.blockFor(e.key)) found = e;
        }
        return found;
    }

    /** When the current pause ends (epoch ms), or 0 if apps are not paused. */
    public static long blockEndsAt(Context c) {
        SharedPreferences p = prefs(c);
        long now = System.currentTimeMillis();
        if (p.getLong(K_BYPASS_UNTIL, 0L) > now) return 0L;
        long end = 0L;
        long test = p.getLong(K_TEST_UNTIL, 0L);
        if (test > now) end = test;
        Entry active = activeEntry(c);
        if (active != null) {
            long activeEnd = active.at + loadConfig(c).blockMinutes * 60_000L;
            if (activeEnd > end) end = activeEnd;
        }
        return end;
    }

    public static boolean isBlockingNow(Context c) {
        return blockEndsAt(c) > System.currentTimeMillis();
    }

    /** Name of the prayer being protected, for the pause screen. */
    public static String activeLabel(Context c) {
        Entry e = activeEntry(c);
        if (e == null) return "Prayer";
        return label(e.key);
    }

    public static String label(String key) {
        if (key == null || key.isEmpty()) return "Prayer";
        return Character.toUpperCase(key.charAt(0)) + key.substring(1);
    }
}
