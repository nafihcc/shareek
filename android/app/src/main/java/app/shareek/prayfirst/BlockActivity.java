package app.shareek.prayfirst;

import android.app.Activity;
import android.content.Intent;
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
import android.widget.TextView;

import java.text.DateFormat;
import java.util.Date;

/**
 * Shown over a paused app. Built in code so it needs no layout resources.
 * Offers a way into Shareek, and (unless Strict mode is on) an emergency
 * unlock that is deliberately slow: ten seconds of waiting before it works.
 */
public class BlockActivity extends Activity {

    static final String EXTRA_PACKAGE = "pkg";
    private static final int EMERGENCY_WAIT_SECONDS = 10;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private TextView countdown;
    private Button emergency;
    private int waitLeft = EMERGENCY_WAIT_SECONDS;

    private final Runnable tick = new Runnable() {
        @Override
        public void run() {
            long end = PrayFirstStore.blockEndsAt(BlockActivity.this);
            long left = end - System.currentTimeMillis();
            if (left <= 0) {
                finish();
                return;
            }
            long minutes = left / 60_000L;
            long seconds = (left / 1000L) % 60L;
            countdown.setText(String.format("%d:%02d", minutes, seconds));

            if (emergency != null) {
                if (waitLeft > 0) {
                    emergency.setEnabled(false);
                    emergency.setText("Emergency access in " + waitLeft + "…");
                    waitLeft--;
                } else {
                    emergency.setEnabled(true);
                    emergency.setText("I need access (5 minutes)");
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

    private Button pill(String label, int fill, int textColor) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setTextColor(textColor);
        b.setTextSize(15);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(fill);
        bg.setCornerRadius(dp(24));
        b.setBackground(bg);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(52));
        lp.topMargin = dp(12);
        b.setLayoutParams(lp);
        return b;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        PrayFirstStore.Config cfg = PrayFirstStore.loadConfig(this);
        String prayer = PrayFirstStore.activeLabel(this);
        long end = PrayFirstStore.blockEndsAt(this);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(Color.parseColor("#0B1F1A"));
        root.setPadding(dp(28), dp(28), dp(28), dp(28));

        TextView arabic = text("حَيَّ عَلَى الصَّلَاة", 26, Color.parseColor("#D9B76A"), false);
        TextView title = text("Pray first", 34, Color.WHITE, true);
        TextView sub = text(
                prayer + " time. Your apps are paused"
                        + (end > 0 ? " until " + DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date(end)) : "")
                        + ".",
                16, Color.parseColor("#B8C7C2"), false);
        countdown = text("", 44, Color.WHITE, true);

        LinearLayout.LayoutParams gap = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        gap.topMargin = dp(12);

        root.addView(arabic);
        root.addView(title, gap);
        root.addView(sub, gap);
        root.addView(countdown, gap);

        Button open = pill("Open Shareek", Color.parseColor("#1F7A5C"), Color.WHITE);
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
            emergency = pill("", Color.parseColor("#1C2E29"), Color.parseColor("#B8C7C2"));
            emergency.setEnabled(false);
            emergency.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    PrayFirstStore.grantEmergency(BlockActivity.this);
                    finish();
                }
            });
            root.addView(emergency);
        }

        setContentView(root);
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

    /** Back goes to the home screen, never back into the paused app. */
    @Override
    public void onBackPressed() {
        Intent home = new Intent(Intent.ACTION_MAIN);
        home.addCategory(Intent.CATEGORY_HOME);
        home.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(home);
        finish();
    }
}
