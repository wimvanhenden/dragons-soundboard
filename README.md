# Lions × Dragons Soundboard

Mobile-first soundboard for the Lions and the Ghent Dragons.
Live at **https://dragons.seeingisbelieving.be** (S3 bucket `ghentdragons.soundboard` behind CloudFront).

## What's in it

- **GOAL!** (wij scoren) and **TEGENGOAL** (zij scoren): two buttons that are always on screen. Each plays a random song from its own list and never the same one twice in a row. GOAL! also shows a full-screen celebration.
- **Hype** tab: snippets for face-offs, time-outs and stoppages.
- **Volledige nummers** tab: full songs for warm-up and breaks.
- Now-playing bar with **Uitfaden** (2.5 s fade) and **Stop**.
- Works offline as an installable app: open the site, tap *Offline* and then *Alles offline bewaren*, and add it to the home screen. The screen stays awake while the app is open.
- Laptop shortcuts: `G` goal, `T` tegengoal, `F` fade, `Esc` stop.

## Changing the songs

Everything is in [`js/tracks.js`](js/tracks.js):

- `GOAL_LIST` / `TEGENGOAL_LIST`: the songs for the two buttons. One song is fine.
- `HYPE`: the snippet pads.
- `FULL`: the full songs.

The mp3s live in S3 under `snippets/` and `original/` and are not in git. To add a song, upload the mp3 to the bucket and add a line to `tracks.js`.

## Files

```
index.html             page
css/app.css            styles
js/app.js              player, UI, offline handling
js/tracks.js           song lists
sw.js                  service worker (offline cache, byte-range audio)
manifest.webmanifest   home-screen app
assets/                logos, arena background, icons, fonts (assets/src = original logos)
deploy.sh              upload to S3 + CloudFront invalidation
```

## Deploy

```bash
./deploy.sh            # live
./deploy.sh preview/   # test copy at /preview/index.html (uses the live mp3s)
```

`deploy.sh` bumps the service-worker version, so phones pick up the new version on their next visit.
