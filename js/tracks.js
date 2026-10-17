// Lions × Dragons soundboard — track list.
// To add a song: upload the mp3 to snippets/, snippets/they_score/ or original/
// and add a line below. The file name is the S3 key inside that folder.
//
// Replaced an mp3 with a new cut under the same name? Add or raise the version
// number at the end of its line (…, 2) so phones that saved the old cut
// offline fetch the new one.

const BASE = (typeof document !== 'undefined' && document.querySelector('meta[name="lxd-audio-base"]')?.content) || '';
const track = (folder) => (artist, title, file, v) => ({ artist, title, src: `${BASE}${folder}${file}${v ? `?v=${v}` : ''}` });
const s = track('snippets/');            // hype snippets
const t = track('snippets/they_score/'); // tegengoal songs
const o = track('original/');            // full songs

// ── The two permanent buttons ─────────────────────────────
// Each button plays a random song from its list (never the same one twice
// in a row when the list has more than one song). A list may hold just 1 song.

// GOAL! — wij scoren
export const GOAL_LIST = [
  s('Pennywise', 'Bro Hymn', 'Bro hymn-Pennywise.mp3'),
];

// TEGENGOAL — zij scoren (folder snippets/they_score/, not shown under Hype)
export const TEGENGOAL_LIST = [
  t('Aqua', 'Barbie Girl', 'Aqua - Barbie Girl (Official Music Video).mp3'),
  t('Katy Perry ft. Snoop Dogg', 'California Gurls', 'Katy Perry - California Gurls (Official Music Video) ft. Snoop Dogg.mp3'),
  t('Rick Astley', 'Never Gonna Give You Up', 'Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster).mp3'),
  t('Shania Twain', 'Man! I Feel Like a Woman!', 'Shania Twain - Man! I Feel Like A Woman! (Official Music Video).mp3'),
  t('Marco Borsato', 'Dromen Zijn Bedrog', 'Marco Borsato - Dromen Zijn Bedrog.mp3'),
  t('Durbuy', "J'aime J'aime Durbuy", "J'aime j'aime Durbuy - FULL & ORIGINAL VERSION !.mp3"),
];

// Hype — face-offs, time-outs & onderbrekingen
export const HYPE = [
  s('AC/DC', 'Thunderstruck', 'AC DC - Thunderstruck.mp3', 2),
  s('Avicii', 'Levels', 'Avicii - Levels.mp3'),
  s('Beastie Boys', 'Sabotage', 'Beastie Boys - Sabotage.mp3'),
  s('Blur', 'Song 2', 'Blur - Song 2.mp3', 2),
  s('Pennywise', 'Bro Hymn', 'Bro hymn-Pennywise.mp3'),
  s('Darude', 'Sandstorm', 'Darude - Sandstorm.mp3', 2),
  s('Dimitri Vegas & Like Mike', 'The Hum', 'Dimitri Vegas - The Hum.mp3', 3),
  s('DJ Snake & Lil Jon', 'Turn Down for What', 'DJ Snake, Lil Jon - Turn Down for What.mp3', 2),
  s('DVBBS & Borgeous', 'Tsunami', 'DVBBS & Borgeous - TSUNAMI.mp3', 2),
  s("Guns N' Roses", 'Welcome to the Jungle', 'Guns N_ Roses - Welcome To The Jungle.mp3', 2),
  s('Dropkick Murphys', "I'm Shipping Up to Boston", 'I_m Shipping Up To Boston - Dropkick Murphys.mp3', 2),
  s('Papa Roach', 'Last Resort', 'Last Resort - Papa Roach.mp3', 2),
  s('Metallica', 'Enter Sandman', 'Metallica - Enter Sandman.mp3', 2),
  s('Pantera', 'Cowboys from Hell', 'Pantera - Cowboys From Hell.mp3', 2),
  s('Ramones', 'Blitzkrieg Bop', 'Ramones - Blitzkrieg Bop.mp3', 2),
  s('Smash Mouth', 'All Star', 'Smash Mouth - All Star.mp3', 2),
  s('Sum 41', 'Fat Lip', 'Sum 41 - Fatlip.mp3'),
  s('The Clash', 'I Fought the Law', 'The Clash - I Fought the Law.mp3', 2),
  s('Wolfmother', 'Joker and the Thief', 'Wolfmother - Joker And The Thief.mp3'),
  s('Zombie Nation', 'Kernkraft 400', 'Zombie Nation - Kernkraft 400.mp3'),
  s('Jimmy Frey', 'Saragossa', 'Jimmy Frey - Saragossa.mp3'),
  s('Janez Detd.', 'Anti-Anthem', 'Janez Detd. - Anti-Anthem.mp3'),
  s('Baha Men', 'Who Let the Dogs Out', 'Baha Men - Who Let The Dogs Out (Official Video).mp3'),
  s('Chumbawamba', 'Tubthumping', 'Chumbawamba - Tubthumping.mp3'),
  s('The Fratellis', 'Chelsea Dagger', 'The Fratellis - Chelsea Dagger.mp3'),
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
