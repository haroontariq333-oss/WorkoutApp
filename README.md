# Overload

An evidence-based workout app built around progressive overload, effort measured in reps in reserve (RIR), 10–20 weekly hard sets per muscle, and protein-first nutrition. It installs on your phone like a native app, works offline, and syncs your training between devices when you sign in.

## Features

- **Plan**: builds a program from your goal (lose fat, build muscle, recomp), experience, equipment and schedule (3, 4 or 5 days), with a weekly-volume chart for each muscle. Equipment options:
  - **Gym**: barbells, cables and machines.
  - **Dumbbells**: dumbbells and a bench.
  - **Kettlebell**: one or two kettlebells. Weight suggestions move up one bell size (4 kg / 10 lb) at a time.
  - **Bodyweight**: only your body and the floor. No bands, bars or furniture.
- **Train**: logs sets with a rest timer, and you can switch equipment right from the tab. Weights are suggested by double progression: once every set reaches the top of the rep range, the app tells you to add weight. Each exercise has form cues and a **Watch how** link that opens a YouTube search for a form tutorial.
- **Progress**: logged sets per muscle over the last 7 days, body-weight trend, estimated 1RM trend for each exercise, and workout history.
- **Nutrition**: calories and macros from the Mifflin–St Jeor equation, adjusted for your goal. **What to eat** builds a sample day from cheap supermarket staples (eggs, chicken thighs, lean beef or mutton, canned tuna, milk, soya chunks, lentils, beans, whole-wheat flatbread, oats, potatoes, frozen vegetables, peanut butter) with portions scaled to your targets. It supports everything, vegetarian or vegan diets, and adds an extra snack when your calories don't fit in four normal meals. It also lists foods that fit your plan and gives tips for eating on a budget.
- **Workout reminders**: pick your training days and a time, and get a notification on your phone when it's time to start, even when the app is closed. No reminder is sent on days you've already trained.
- **Exercises**: 59 exercises with form cues and video links.
- **Accounts and sync**: sign up with email and password and confirm your email, and your workouts, weigh-ins and settings follow you across devices. Forgot-password emails, password change, account deletion and a privacy policy are built in.
- **Installable**: add it to your home screen on iPhone or Android, or install it on desktop. It opens full-screen and works offline.

## Run it

Requires Node.js 22.13 or newer. There are no npm dependencies.

```sh
npm start          # http://localhost:3000
npm test           # server, auth and sync tests
```

Environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Port to listen on |
| `DATA_DIR` | `./data` | Folder for the SQLite database |
| `COOKIE_SECURE` | unset | Set to `1` in production (HTTPS) so session cookies are only sent over HTTPS |
| `TRUST_PROXY` | unset | Set to `1` behind a reverse proxy so rate limiting uses the real client IP |
| `VAPID_SUBJECT` | `mailto:admin@example.com` | Contact address push services can use to reach you. Set it to your email (`mailto:you@example.com`) |
| `EMAIL_FROM` | unset | Sender for account emails, e.g. `Overload <you@gmail.com>` |
| `BREVO_API_KEY` or `RESEND_API_KEY` | unset | API key for the email provider. With `EMAIL_FROM` and one key set, new accounts must confirm their email and password reset is on. Without them, sign-ups skip confirmation and password reset is off |
| `APP_URL` | Render's address | Public address used in email links, e.g. `https://overload.example.com`. On Render it defaults to the `onrender.com` address; set it if you add your own domain |
| `OPERATOR_NAME` | "the operator of this app" | Your name or organization, shown in the privacy policy |
| `PRIVACY_CONTACT` | from `VAPID_SUBJECT` | Email address for privacy questions, shown in the privacy policy |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | generated | Push signing keys. If unset, they're generated once and saved in `DATA_DIR/vapid.json`. Keep them stable, or devices must turn reminders on again |

## Deploy

The app needs a host with HTTPS and a persistent disk, because the SQLite database lives in `/data`.

### Render (recommended)

The repo includes `render.yaml`, which sets everything up.

1. Push this code to your default branch on GitHub.
2. In Render, choose **New → Blueprint** and pick this repository.
3. Fill in the values Render asks for:
   - `VAPID_SUBJECT`: `mailto:` followed by your email address.
   - `EMAIL_FROM` and `BREVO_API_KEY`: see **Account emails** below. Leave `RESEND_API_KEY` empty if you use Brevo.
   - `OPERATOR_NAME` and `PRIVACY_CONTACT`: your name and the email address people can contact about their data.
4. Click **Apply**. Render builds the Docker image, creates a 1 GB disk at `/data` and gives you an `https://….onrender.com` address.

This uses the Starter plan, because free services have no disk and lose data on every restart.

### Account emails

Confirmation and password reset emails go through an email provider's API. Both of these have free plans:

- **Brevo**: 300 emails a day. You can send from an address you already have, such as a Gmail address, after confirming it in Brevo (**Senders, Domains & Dedicated IPs → Senders**). Create an API key under **SMTP & API → API Keys**, then set `EMAIL_FROM=Overload <that-address>` and `BREVO_API_KEY`.
- **Resend**: 3,000 emails a month, 100 a day. It needs a domain you own, verified in Resend. Set `EMAIL_FROM=Overload <hello@yourdomain.com>` and `RESEND_API_KEY`.

Emails from a free Gmail address are more likely to land in spam than emails from your own domain. Tell users to check their spam folder; the app says this too.

### Privacy policy

The policy is at `/privacy` and is linked from the app's footer and the sign-up form. New accounts must agree to it. The server fills in `OPERATOR_NAME`, `PRIVACY_CONTACT` and your app's address. Read it and adjust `public/privacy.html` if you add features that collect more data. It's a reasonable starting point, not legal advice.

### Any Docker host

```sh
docker build -t overload .
docker run -p 3000:3000 -v overload-data:/data \
  -e COOKIE_SECURE=1 -e TRUST_PROXY=1 -e VAPID_SUBJECT=mailto:you@example.com overload
```

Put it behind a reverse proxy that provides HTTPS. On Railway or Fly.io, deploy with the `Dockerfile`, attach a volume at `/data`, and set the same variables.

The container starts as root only long enough to take ownership of the data disk, then runs as the unprivileged `node` user.

### Backups

All accounts and workouts are in `/data/overload.db`. Turn on disk snapshots at your host (Render takes daily snapshots of disks), or copy the file regularly. Keep `/data/vapid.json` too, or every device has to turn reminders on again.

### Installing on your phone

- **iPhone (Safari)**: open the site, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome)**: open the site and tap **Install app** in the header, or choose **Install app** from the browser menu.

## Publish it as a downloadable app

**Free, works today:** the app is a Progressive Web App. Once it's live, people install it from the website, with no app store:

- **Android**: Chrome shows **Install app**, which adds a real app icon and opens full-screen.
- **iPhone and iPad**: in Safari, **Share → Add to Home Screen**. This is the only free way onto iPhones; reminders work this way too (iOS 16.4 or newer).
- **Windows, Mac and ChromeOS**: Chrome and Edge show an install button in the address bar.

**Free Android APK file:** [PWABuilder](https://www.pwabuilder.com) packages your live site as an Android app (a Trusted Web Activity) that you can offer as a download on your website. Enter your app's address, choose **Android**, download the package, and upload the `.apk` to your site. Keep the signing key it gives you; you need it for every update. For the app to open without a browser bar, add the `assetlinks.json` file PWABuilder generates to `public/.well-known/`. Note that Google is rolling out developer verification for Android apps installed from outside the Play Store: free "limited distribution" accounts cover up to 20 devices, and wider distribution will need a verified developer account.

**App stores (not free):** Google Play has a one-time US$25 registration fee and accepts the same PWABuilder package (as an `.aab`). Apple's App Store needs the Apple Developer Program at US$99 a year.

## How reminders work

Reminders use the standard Web Push protocol, implemented with Node's built-in crypto. No third-party service account is needed.

1. When you turn reminders on, the device asks for notification permission and registers with its browser's push service (Google, Mozilla, Apple or Microsoft).
2. The server stores your days, time and time zone.
3. Every 30 seconds the server checks for reminders that are due. It sends an encrypted notification within 30 minutes of the chosen time, at most once a day, and skips days you've already logged a workout.

On iPhone, notifications work for the app added to the Home Screen (iOS 16.4 or newer), not in a Safari tab. Private or incognito windows can't receive notifications.

## How sync works

Each device keeps a full copy of your data, so the app works offline. When you sign in, or after any change, the device sends its data to the server. The server merges it with your account and sends the result back:

- Workouts from all devices are combined.
- A deleted workout stays deleted everywhere, even if an older device still has it.
- For weigh-ins on the same day, the most recent entry wins.
- The most recently changed settings win.

Unfinished workouts in progress stay on the device where you started them.

## Security

- Passwords are hashed with scrypt. Sessions use random tokens, stored only as SHA-256 hashes, in `HttpOnly` cookies with `SameSite=Lax`.
- Writes must be same-origin JSON requests, which blocks cross-site request forgery.
- Sign-in attempts are rate limited, and all synced data is validated on the server.
- A strict Content Security Policy only allows the app's own scripts.

## Project layout

```
public/      the app (HTML, CSS, JS, service worker, manifest, icons)
  merge.js   sync validation and merging, shared by the browser and server
server/      HTTP server, accounts and sync API (Node built-ins + SQLite)
test/        node:test suite
```

## Disclaimer

Independent project. Not affiliated with or endorsed by any coach or fitness brand. General fitness information only.
