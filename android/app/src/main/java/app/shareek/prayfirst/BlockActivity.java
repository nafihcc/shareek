package app.shareek.prayfirst;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.text.DateFormat;
import java.util.Date;

/**
 * Shown over a locked app. Built in code so it needs no layout resources.
 *
 * "I've prayed" releases the lock and opens the app the user was trying to
 * reach; nobody checks, it is between the user and Allah. A deliberately slow
 * emergency unlock (10 s wait, 5 minutes) is offered below it unless Strict
 * mode is on.
 */
public class BlockActivity extends Activity {

    static final String EXTRA_PACKAGE = "pkg";
    private static final int EMERGENCY_WAIT_SECONDS = 10;

    /** {Arabic, English, reference} — short, well-known verses about prayer. */
    private static final String[][] VERSES = {
            {"وَأَقِمِ الصَّلَاةَ لِذِكْرِي", "Establish prayer for My remembrance.", "Ta-Ha 20:14"},
            {"فَاذْكُرُونِي أَذْكُرْكُمْ", "So remember Me; I will remember you.", "Al-Baqarah 2:152"},
            {"إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
                    "Indeed, prayer prevents immorality and wrongdoing.", "Al-Ankabut 29:45"},
    };

    private final Handler handler = new Handler(Looper.getMainLooper());
    private TextView countdown;
    private Button emergency;
    private int waitLeft = EMERGENCY_WAIT_SECONDS;
    private String blockedPackage;
    private boolean timed;

    private final Runnable tick = new Runnable() {
        @Override
        public void run() {
            long end = PrayFirstStore.blockEndsAt(BlockActivity.this);
            long left = end - System.currentTimeMillis();
            if (left <= 0) {
                finish();
                return;
            }
            if (timed) {
                countdown.setText(String.format("%d:%02d", left / 60_000L, (left / 1000L) % 60L));
            }
            if (emergency != null) {
                if (waitLeft > 0) {
                    emergency.setEnabled(false);
                    emergency.setText("Emergency access in " + waitLeft + "…");
                    waitLeft--;
                } else {
                    emergency.setEnabled(true);
                    emergency.setText("I can't pray now · open for 5 minutes");
                }
            }
            handler.postDelayed(this, 1000L);
        }
    };

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    private TextView text(String s, int sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(sp);
        t.setTextColor(color);
        t.setGravity(Gravity.CENTER);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private Button pill(String label, int fill, int textColor, int heightDp) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setTextColor(textColor);
        b.setTextSize(16);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(fill);
        bg.setCornerRadius(dp(heightDp / 2));
        b.setBackground(bg);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(heightDp));
        lp.topMargin = dp(12);
        b.setLayoutParams(lp);
        return b;
    }

    private LinearLayout.LayoutParams gap(int topDp) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.topMargin = dp(topDp);
        return lp;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        blockedPackage = getIntent().getStringExtra(EXTRA_PACKAGE);
        PrayFirstStore.Config cfg = PrayFirstStore.loadConfig(this);
        String prayer = PrayFirstStore.activeLabel(this);
        long end = PrayFirstStore.blockEndsAt(this);
        // A one-minute test window is always a timer, whatever the mode.
        timed = !cfg.untilPrayed || PrayFirstStore.activeEntry(this) == null;

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(dp(26), dp(56), dp(26), dp(28));

        String[] verse = VERSES[(int) ((System.currentTimeMillis() / 60_000L) % VERSES.length)];
        TextView title = text("Pray first", 34, Color.WHITE, true);
        TextView sub = text(
                timed
                        ? prayer + " time. Your apps are locked"
                                + (end > 0 ? " until " + DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date(end)) : "")
                                + "."
                        : "It's time for " + prayer + ". Your apps stay locked until you've prayed.",
                16, Color.parseColor("#B8C7C2"), false);
        countdown = text(timed ? "" : "🕌", timed ? 46 : 54, Color.WHITE, true);

        // Verse card
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setGravity(Gravity.CENTER);
        card.setPadding(dp(20), dp(20), dp(20), dp(20));
        GradientDrawable cardBg = new GradientDrawable();
        cardBg.setColor(Color.parseColor("#13342B"));
        cardBg.setCornerRadius(dp(22));
        card.setBackground(cardBg);
        TextView arabic = text(verse[0], 24, Color.parseColor("#E6C77A"), false);
        arabic.setLineSpacing(0f, 1.25f);
        card.addView(arabic);
        card.addView(text(verse[1], 15, Color.WHITE, false), gap(10));
        card.addView(text(verse[2], 12, Color.parseColor("#8FA8A0"), false), gap(6));

        root.addView(title);
        root.addView(sub, gap(10));
        root.addView(countdown, gap(14));
        root.addView(card, gap(18));

        Button prayed = pill("I've prayed", Color.parseColor("#1F9E73"), Color.WHITE, 56);
        prayed.setTypeface(Typeface.DEFAULT_BOLD);
        prayed.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                PrayFirstStore.markPrayed(BlockActivity.this);
                openBlockedApp();
                finish();
            }
        });
        root.addView(prayed, gap(22));

        Button open = pill("Open Shareek", Color.parseColor("#1C2E29"), Color.parseColor("#D5E2DD"), 48);
        open.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent i = new Intent(BlockActivity.this, MainActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(i);
                finish();
            }
        });
        root.addView(open);

        if (!cfg.strict) {
            emergency = pill("", Color.TRANSPARENT, Color.parseColor("#8FA8A0"), 44);
            emergency.setTextSize(13);
            emergency.setEnabled(false);
            emergency.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    PrayFirstStore.grantEmergency(BlockActivity.this);
                    openBlockedApp();
                    finish();
                }
            });
            root.addView(emergency);
        }

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.parseColor("#0B1F1A"));
        scroll.addView(root);
        setContentView(scroll);
    }

    /** Take the user to the app they were trying to open, now that it is unlocked. */
    private void openBlockedApp() {
        if (blockedPackage == null) return;
        try {
            PackageManager pm = getPackageManager();
            Intent launch = pm.getLaunchIntentForPackage(blockedPackage);
            if (launch != null) {
                launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(launch);
            }
        } catch (RuntimeException ignored) {
            // The user can still open it from the home screen.
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        waitLeft = EMERGENCY_WAIT_SECONDS;
        handler.removeCallbacks(tick);
        handler.post(tick);
    }

    @Override
    protected void onPause() {
        handler.removeCallbacks(tick);
        super.onPause();
    }

    /** Back goes to the home screen, never back into the locked app. */
    @Override
    public void onBackPressed() {
        Intent home = new Intent(Intent.ACTION_MAIN);
        home.addCategory(Intent.CATEGORY_HOME);
        home.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(home);
        finish();
    }
}
