# Lions × Dragons Soundboard

Mobile-first soundboard for the Lions and the Ghent Dragons.
Live at **https://dragons.seeingisbelieving.be** (S3 bucket `ghentdragons.soundboard` behind CloudFront).

## What's in it

- **GOAL!** (wij scoren) and **TEGENGOAL** (zij scoren): two buttons that are always on screen. Each list is shuffled when the app opens and played in that order. Once every song has played, the list is reshuffled, and the new round never starts with the song that just played. GOAL! also shows a full-screen celebration.
- **Hype** tab: snippets for face-offs, time-outs and stoppages. The pads come in a new random order every time the app opens. **Shuffle** (next to the tabs) plays a random Hype snippet, never the goal song and no repeats until every snippet has played.
- **Volledige nummers** tab: full songs for warm-up and breaks.
- Now-playing bar with **Uitfaden** (2.5 s fade) and **Stop**.
- Works offline as an installable app: open the site, tap *Offline* and then *Alles offline bewaren*, and add it to the home screen. The screen stays awake while the app is open.
- Laptop shortcuts: `G` goal, `T` tegengoal, `R` shuffle, `F` fade, `Esc` stop.

## Changing the songs

Everything is in [`js/tracks.js`](js/tracks.js):

- `GOAL_LIST`: songs for GOAL! (from `snippets/`). One song is fine.
- `TEGENGOAL_LIST`: songs for TEGENGOAL (from `snippets/they_score/`). These don't appear under Hype.
- `HYPE`: the snippet pads (from `snippets/`).
- `FULL`: the full songs (from `original/`).

The mp3s live in S3 under `snippets/`, `snippets/they_score/` and `original/` and are not in git. To add a song, upload the mp3 to the bucket and add a line to `tracks.js`. If you replace an mp3 with a new cut under the same name, add or raise the version number at the end of its line (for example `…mp3', 2)`) so phones that saved the old cut offline fetch the new one. Previous cuts are kept in S3 under `legacy/`.

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
