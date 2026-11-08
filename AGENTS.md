<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the daily tracker browser-local in the static GitHub Pages build; no account or server exists to sync entries between devices.
- Host the static app through the GitHub Pages workflow with the repository base path; TanStack Start's server output is not the Pages artifact.
- Use an absolute published asset URL for the About portrait so GitHub Pages can display it outside the origin-specific relative asset path namespace.
- The GitHub Pages SPA build skips the root html/head shell (VITE_STATIC_SPA define); rendering <html> plus HeadContent inside #root freezes the page.
- Theme switching applies semantic CSS tokens through the document dark class and saves only the theme preference locally, so the same control works in hosted and static Pages builds without altering tracker data.
- Prayer alerts use public/notify-sw.js, a notification-only worker that caches nothing, so installs never serve stale pages; alerts are scheduled in the open app because static Pages has no push server.
- The site has two designs: Classic (default token set in styles.css) and Professional, applied by `<html data-design="pro">` (saved as `faiz.design`, default in DesignToggle.tsx). Pro only overrides tokens and a few `data-ui` hooks, so new components should use semantic tokens (bg-panel, text-deep, border-border) to work in both.
- /android is a plain-Java Android wrapper that serves the static build (base path "/") from assets/www and exposes `window.ShareekNative`. Pray First (src/routes/pray-first.tsx) works out the prayer schedule in JS and hands it to the app; blocking is native-only and no-ops in a browser. Build the APK with the "Build Android APK" workflow.
