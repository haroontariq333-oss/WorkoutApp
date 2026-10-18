# Overload

An evidence-based workout app built around progressive overload, effort measured in reps in reserve (RIR), 10–20 weekly hard sets per muscle, and protein-first nutrition. It installs on your phone like a native app, works offline, and syncs your training between devices when you sign in.

## Features

- **Plan**: builds a program from your goal (lose fat, build muscle, recomp), experience, equipment (full gym, dumbbells, bodyweight) and schedule (3, 4 or 5 days), with a weekly-volume chart for each muscle.
- **Train**: logs sets with a rest timer. Weights are suggested by double progression: once every set reaches the top of the rep range, the app tells you to add weight.
- **Progress**: logged sets per muscle over the last 7 days, body-weight trend, estimated 1RM trend for each exercise, and workout history.
- **Nutrition**: calories and macros from the Mifflin–St Jeor equation, adjusted for your goal.
- **Exercises**: 40 exercises with form cues.
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
