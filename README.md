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
- **Accounts and sync**: sign in with email and password, and your workouts, weigh-ins and settings follow you across devices.
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
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | generated | Push signing keys. If unset, they're generated once and saved in `DATA_DIR/vapid.json`. Keep them stable, or devices must turn reminders on again |

## Deploy

Installing on a phone requires HTTPS, so deploy to any host that gives you HTTPS and a persistent disk for the database. With Docker:

```sh
docker build -t overload .
docker run -p 3000:3000 -v overload-data:/data -e COOKIE_SECURE=1 -e TRUST_PROXY=1 overload
```

On Render, Railway or Fly.io, deploy the repo with the included `Dockerfile`, attach a persistent volume at `/data`, and set `COOKIE_SECURE=1` and `TRUST_PROXY=1`.

### Installing on your phone

- **iPhone (Safari)**: open the site, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome)**: open the site and tap **Install app** in the header, or choose **Install app** from the browser menu.

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
