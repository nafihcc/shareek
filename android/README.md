# Shareek for Android

A thin Android app that runs the Shareek website offline and adds **Pray First**:
at prayer time it can play the adhan and pause the apps you choose.

## Get the APK (no Android Studio needed)

1. Push this branch to GitHub.
2. Open the repo's **Actions** tab → **Build Android APK** → **Run workflow**.
3. When it finishes, download `shareek-pray-first-apk` from the run's **Artifacts**,
   unzip it, and copy `shareek-pray-first.apk` to your phone.
4. Open it on the phone and allow "install unknown apps" when asked.

Pushing a tag such as `apk-v1.0.0` also attaches the APK to a GitHub release.

The APK is **debug-signed**, which is fine for installing on your own phone.
It is not suitable for the Play Store (that needs your own release key).

## Add the adhan recording

No recording is bundled, because the right one is your choice (and must be one
you have the right to use). Without it you still get the prayer notification and
the app pause, just no sound.

Put an audio file named exactly `adhan.mp3` (or `adhan.ogg`) in
`android/app/src/main/res/raw/` and build again. The Pray First page shows
"No adhan recording is bundled" until you do.

## First-time setup on the phone

Open **Pray First** in the app and follow the three steps:

1. **Turn on the app blocker** — Settings → Accessibility → Installed apps →
   *Shareek Pray First* → On. Android will show a warning; that is normal for
   any app that detects other apps.
2. **Allow notifications.**
3. **Battery:** choose "Don't optimise" so alarms are never delayed.

Then tick the apps to pause, pick how long, and use **Pause apps for 1 minute**
to see it work before you rely on it.

## How it works

- The website works out the next 10 days of prayer times with the same
  calculation as the rest of the site and hands them to the app. Open Shareek at
  least once every ten days to top the schedule up (you'll get a notification
  if it runs out).
- One exact alarm is kept for the next prayer. When it fires, the app notifies
  you and plays the adhan if enabled.
- Whether apps are paused is worked out from the stored schedule each time an
  app opens, so a late alarm cannot leave a window unprotected.
- The blocker is an Accessibility service that only receives window-change
  events and has `canRetrieveWindowContent="false"`: it learns *which app* is in
  front, and cannot read the screen, messages or anything typed.
- The pause screen has an **emergency access** button that unlocks for 5
  minutes after a 10-second wait. **Strict mode** removes it.

## Layout

```
android/
  app/src/main/
    java/app/shareek/prayfirst/
      MainActivity.java        WebView host, serves assets/www offline
      NativeBridge.java        window.ShareekNative for the website
      PrayFirstStore.java      settings + schedule + "paused right now?"
      PrayFirstScheduler.java  one exact alarm for the next prayer
      PrayerAlarmReceiver.java notification + adhan, then arms the next alarm
      BootReceiver.java        re-arms after reboot / time change
      AdhanService.java        plays res/raw/adhan.*
      AppBlockerService.java   Accessibility service (package name only)
      BlockActivity.java       the "Pray first" screen
    assets/www/                built website (created by the workflow)
```

## Building locally

```sh
BASE_PATH=/ npm run build:gh
mv dist-gh/gh-index.html dist-gh/index.html
mkdir -p android/app/src/main/assets/www && cp -r dist-gh/. android/app/src/main/assets/www/
cd android && gradle assembleDebug     # or open /android in Android Studio
```

Needs JDK 17 and the Android SDK (platform 34).
