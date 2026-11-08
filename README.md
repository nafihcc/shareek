# Faiz

Faiz is an Islamic companion website for prayer times, Quran reading, finding the Qibla, daily dhikr and personal worship tracking. It is designed around the traditional prayer-time reckoning explained on its Methodology page.

## What you can do

- **Check prayer times** for a chosen location: Fajr, sunrise, Dhuhr, Asr, Maghrib and Isha. Fajr defaults to 20° below the astronomical horizon; sunrise uses the standard 0.833° horizon; Dhuhr uses solar transit; Maghrib is fixed at four minutes after calculated sunset; Isha defaults to 18°. Choose Standard or Hanafi Asr and adjust the Fajr and Isha angles in method settings.
- **View a monthly timetable** for your selected location.
- **Read the Quran** in Arabic, by one of 604 Mushaf pages or by individual ayah, with Mishary Alafasy recitation and a collapsible Surah search. Quran text and audio load from [AlQuran Cloud](https://alquran.cloud/), so an internet connection is required.
- **Find the Qibla** with compass views or a camera overlay. Device orientation and camera modes require a compatible device, browser permission and a secure connection.
- **Count dhikr** with a personal tally counter.
- **Track your daily worship**: record swalat, istighfar, Quran pages and wake-up time for each calendar day, then compare recent averages with the previous week. An earlier wake-up time is treated as an improvement.
- **Meet the creator** on the About page and get in touch by WhatsApp.

## Your data

Tracker entries, dhikr totals and location settings are saved in your browser on this device. They remain available when you reopen the same site in the same browser, including on GitHub Pages. There is no account or cross-device sync. Private/incognito sessions, clearing site data, or changing the site's address can remove or separate saved entries. Your device's browser permissions control location, orientation and camera access.

## Technology

- React 19 and TypeScript with TanStack Start
- Tailwind CSS v4
- Client-side solar calculations for prayer times; no timetable API is needed for those calculations
- A separate static Vite build for GitHub Pages

## Run the project

Install [Bun](https://bun.sh/) and run:

```sh
bun install
bun run dev
```

To prepare the GitHub Pages version locally, run `bun run build:gh`. The standard `bun run build` is the TanStack Start build, not the Pages artifact.

## Publish on GitHub Pages

1. Put this project in a GitHub repository named **faiz**, with its default branch set to `main`.
2. In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source.
3. The included workflow deploys whenever you push to `main`. You can also run **Deploy to GitHub Pages** from the repository's **Actions** tab.
4. Once deployment finishes, open `https://<your-username>.github.io/faiz/` (or the URL shown in the Pages settings). The workflow configures the repository subpath automatically.

No project-specific API keys are needed for this static deployment. Quran reading still requires an internet connection; the camera and compass depend on browser support.

## Creator

Mohammed Nafih C C · [WhatsApp](https://wa.me/919048291729)

Made through vibe coding.
