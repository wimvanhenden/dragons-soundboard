// Lions × Dragons soundboard — track list.
// To add a song: drop the mp3 in snippets/ or original/ and add a line below.
// `src` is the path relative to the site root (same as the S3 key).

const BASE = (typeof document !== 'undefined' && document.querySelector('meta[name="lxd-audio-base"]')?.content) || '';
const s = (artist, title, file) => ({ artist, title, src: `${BASE}snippets/${file}` });
const o = (artist, title, file) => ({ artist, title, src: `${BASE}original/${file}` });

// ── The two permanent buttons ─────────────────────────────
// Each button plays a random song from its list (never the same one twice
// in a row when the list has more than one song). A list may hold just 1 song.

// GOAL! — wij scoren
export const GOAL_LIST = [
  s('Pennywise', 'Bro Hymn', 'Bro hymn-Pennywise.mp3'),
];

// TEGENGOAL — zij scoren
export const TEGENGOAL_LIST = [
  s('The Clash', 'I Fought the Law', 'The Clash - I Fought the Law.mp3'),
  s('Ramones', 'Blitzkrieg Bop', 'Ramones - Blitzkrieg Bop.mp3'),
  s('Arena-orgel', 'Hockey Organ 2', 'Hockey Arena Organ - 2.mp3'),
];

// Hype — face-offs, time-outs & onderbrekingen
export const HYPE = [
  s('AC/DC', 'Thunderstruck', 'AC DC - Thunderstruck.mp3'),
  s('Avicii', 'Levels', 'Avicii - Levels.mp3'),
  s('Beastie Boys', 'Sabotage', 'Beastie Boys - Sabotage.mp3'),
  s('Blur', 'Song 2', 'Blur - Song 2.mp3'),
  s('Pennywise', 'Bro Hymn', 'Bro hymn-Pennywise.mp3'),
  s('Darude', 'Sandstorm', 'Darude - Sandstorm.mp3'),
  s('Dimitri Vegas & Like Mike', 'The Hum', 'Dimitri Vegas - The Hum.mp3'),
  s('DJ Snake & Lil Jon', 'Turn Down for What', 'DJ Snake, Lil Jon - Turn Down for What.mp3'),
  s('DVBBS & Borgeous', 'Tsunami', 'DVBBS & Borgeous - TSUNAMI.mp3'),
  s("Guns N' Roses", 'Welcome to the Jungle', 'Guns N_ Roses - Welcome To The Jungle.mp3'),
  s('Arena-orgel', 'Hockey Organ 1', 'Hockey Arena Organ - 1.mp3'),
  s('Arena-orgel', 'Hockey Organ 2', 'Hockey Arena Organ - 2.mp3'),
  s('Dropkick Murphys', "I'm Shipping Up to Boston", 'I_m Shipping Up To Boston - Dropkick Murphys.mp3'),
  s('Papa Roach', 'Last Resort', 'Last Resort - Papa Roach.mp3'),
  s('Metallica', 'Enter Sandman', 'Metallica - Enter Sandman.mp3'),
  s('Pantera', 'Cowboys from Hell', 'Pantera - Cowboys From Hell.mp3'),
  s('Ramones', 'Blitzkrieg Bop', 'Ramones - Blitzkrieg Bop.mp3'),
  s('Smash Mouth', 'All Star', 'Smash Mouth - All Star.mp3'),
  s('Sum 41', 'Fat Lip', 'Sum 41 - Fatlip.mp3'),
  s('The Clash', 'I Fought the Law', 'The Clash - I Fought the Law.mp3'),
  s('Wolfmother', 'Joker and the Thief', 'Wolfmother - Joker And The Thief.mp3'),
  s('Zombie Nation', 'Kernkraft 400', 'Zombie Nation - Kernkraft 400.mp3'),
];

// Volledige nummers — opwarming & pauzes
export const FULL = [
  o('AC/DC', 'Thunderstruck', 'AC DC - Thunderstruck (Official Video).mp3'),
  o('Avicii', 'Levels', 'Avicii - Levels.mp3'),
  o('Beastie Boys', 'Sabotage', 'Beastie Boys - Sabotage (Official Music Video).mp3'),
  o('Blur', 'Song 2', 'Blur - Song 2 (Official Music Video).mp3'),
  o('Darude', 'Sandstorm', 'Darude - Sandstorm.mp3'),
  o('Dimitri Vegas & Like Mike vs Ummet Ozcan', 'The Hum', 'Dimitri Vegas & Like Mike vs Ummet Ozcan - The Hum (Official Music Video).mp3'),
  o('DJ Snake & Lil Jon', 'Turn Down for What', 'DJ Snake, Lil Jon - Turn Down for What.mp3'),
  o('Dropkick Murphys', "I'm Shipping Up to Boston", 'I_m Shipping Up To Boston - Dropkick Murphys.mp3'),
  o('DVBBS & Borgeous', 'Tsunami (Original Mix)', 'DVBBS & Borgeous - TSUNAMI (Original Mix).mp3'),
  o('Eminem', 'Lose Yourself', 'Eminem - Lose Yourself.mp3'),
  o("Guns N' Roses", 'Welcome to the Jungle', 'Guns N_ Roses - Welcome To The Jungle.mp3'),
  o('Arena-orgel', 'Hockey Organ — Song 1', 'Hockey Arena Organ (Song 1).mp3'),
  o('Arena-orgel', 'Hockey Organ — Song 3', 'Hockey Arena Organ (Song 3).mp3'),
  o('Lynyrd Skynyrd', 'Sweet Home Alabama', 'Lynyrd Skynyrd - Sweet Home Alabama (Audio).mp3'),
  o('Metallica', 'Enter Sandman', 'Metallica Enter Sandman (Official Music Video).mp3'),
  o('Netsky', 'Come Alive', 'Netsky - Come Alive - Official Video.mp3'),
  o('Pantera', 'Cowboys from Hell', 'Pantera - Cowboys From Hell (Official Music Video) [4K Remaster].mp3'),
  o('Papa Roach', 'Last Resort', 'Last Resort - Papa Roach official Music Video (Uncut).mp3'),
  o('Pennywise', 'Bro Hymn', 'Bro hymn-Pennywise.mp3'),
  o('Ramones', 'Blitzkrieg Bop', 'Ramones - Blitzkrieg Bop (Official Music Video).mp3'),
  o('Showtek', 'Booyah', 'Showtek - Booyah.mp3'),
  o('Showtek ft. We Are Loud & Sonny Wilson', 'Booyah (video edit)', 'Showtek ft. We Are Loud & Sonny Wilson - Booyah (Official Music Video).mp3'),
  o('Smash Mouth', 'All Star', 'Smash Mouth - All Star.mp3'),
  o("Stompin' Tom Connors", 'The Hockey Song', 'The Hockey Song.mp3'),
  o('Sum 41', 'Fat Lip', 'Sum 41 - Fatlip (Official Music Video).mp3'),
  o('Survivor', 'Eye of the Tiger', 'Survivor - Eye Of The Tiger (Official HD Video).mp3'),
  o('The Clash', 'I Fought the Law', 'The Clash - I Fought the Law (Official Video).mp3'),
  o('Willy Sommers', 'Laat de zon in je hart', 'Willy Sommers-Laat de zon in je hart 2008.mp3'),
  o('Wolfmother', 'Joker and the Thief', 'Wolfmother - Joker And The Thief (Audio).mp3'),
  o('Zombie Nation', 'Kernkraft 400', 'Zombie Nation - Kernkraft 400.mp3'),
];

export const ALL_AUDIO = [...new Set([...GOAL_LIST, ...TEGENGOAL_LIST, ...HYPE, ...FULL].map(t => t.src))];
