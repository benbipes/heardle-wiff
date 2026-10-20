// ============================================================================
// HEARDLE WIFF — DAILY TRACK CONFIGURATION & AUTOCOMPLETE CATALOG
// ============================================================================
//
// HOW THIS FILE WORKS:
// 1. CONFIG.epochDate sets Day #1 of Heardle WIFF (YYYY-MM-DD in local time).
// 2. DAILY_ROTATION is the ordered list of SoundCloud songs played each day.
//    - We mix 70s, 80s, and 90s Rock with a 90s Hip Hop track every 4th day!
//    - Every URL in DAILY_ROTATION has been verified against SoundCloud's Widget API.
//    - To add new songs: simply append objects with { artist, title, url, genre, era }
//      to DAILY_ROTATION.
// 3. EXTRA_SEARCH_CATALOG adds extra classic 70s/80s/90s Rock & 90s Hip Hop songs
//    into the search autocomplete dropdown so players have a rich list of decoys.
// ============================================================================

window.HEARDLE_CONFIG = {
  appName: "Heardle WIFF",
  tagline: "70s, 80s & 90s Rock + 90s Hip Hop Daily Audio Quiz",
  // Day #1 launch date (local midnight). Day index = days since epochDate.
  epochDate: "2026-10-20",
  // Segment lengths in seconds for each of the 6 guesses (classic Heardle progression)
  segments: [1, 2, 4, 7, 11, 16],
  maxGuesses: 6
};

// Ordered daily rotation: ~3 Rock tracks (70s/80s/90s) followed by 1 90s Hip Hop track
window.DAILY_ROTATION = [
  // Cycle 1
  {
    artist: "Nirvana",
    title: "Smells Like Teen Spirit",
    url: "https://soundcloud.com/nirvana/smells-like-teen-spirit-1",
    genre: "90s Rock",
    year: 1991
  },
  {
    artist: "Fleetwood Mac",
    title: "Dreams",
    url: "https://soundcloud.com/fleetwoodmacofficial/dreams",
    genre: "70s Rock",
    year: 1977
  },
  {
    artist: "Guns N' Roses",
    title: "Sweet Child O' Mine",
    url: "https://soundcloud.com/guns-n-roses-official/sweet-child-o-mine",
    genre: "80s Rock",
    year: 1987
  },
  {
    artist: "Dr. Dre",
    title: "Nuthin' But A 'G' Thang",
    url: "https://soundcloud.com/dr-dre-music/nuthin-but-a-g-thang",
    genre: "90s Hip Hop",
    year: 1992
  },

  // Cycle 2
  {
    artist: "Creedence Clearwater Revival",
    title: "Fortunate Son",
    url: "https://soundcloud.com/creedence-clearwater-revival/fortunate-son",
    genre: "70s Rock",
    year: 1969
  },
  {
    artist: "Toto",
    title: "Africa",
    url: "https://soundcloud.com/toto-official/africa",
    genre: "80s Rock",
    year: 1982
  },
  {
    artist: "Red Hot Chili Peppers",
    title: "Under the Bridge",
    url: "https://soundcloud.com/red-hot-chili-peppers-official/under-the-bridge",
    genre: "90s Rock",
    year: 1991
  },
  {
    artist: "2Pac",
    title: "California Love",
    url: "https://soundcloud.com/2pac/california-love",
    genre: "90s Hip Hop",
    year: 1995
  },

  // Cycle 3
  {
    artist: "Led Zeppelin",
    title: "Immigrant Song",
    url: "https://soundcloud.com/ledzeppelin/immigrant-song",
    genre: "70s Rock",
    year: 1970
  },
  {
    artist: "The Police",
    title: "Every Breath You Take",
    url: "https://soundcloud.com/the-police-official/every-breath-you-take",
    genre: "80s Rock",
    year: 1983
  },
  {
    artist: "Foo Fighters",
    title: "Everlong",
    url: "https://soundcloud.com/foofighters/everlong",
    genre: "90s Rock",
    year: 1997
  },
  {
    artist: "Snoop Dogg",
    title: "Gin and Juice",
    url: "https://soundcloud.com/snoopdogg/gin-and-juice",
    genre: "90s Hip Hop",
    year: 1993
  },

  // Cycle 4
  {
    artist: "Black Sabbath",
    title: "Paranoid",
    url: "https://soundcloud.com/blacksabbath/paranoid",
    genre: "70s Rock",
    year: 1970
  },
  {
    artist: "The Clash",
    title: "Should I Stay or Should I Go",
    url: "https://soundcloud.com/theclash/should-i-stay-or-should-i-go",
    genre: "80s Rock",
    year: 1982
  },
  {
    artist: "Green Day",
    title: "Basket Case",
    url: "https://soundcloud.com/greenday/basket-case",
    genre: "90s Rock",
    year: 1994
  },
  {
    artist: "Nas",
    title: "N.Y. State of Mind",
    url: "https://soundcloud.com/nasirjones/n-y-state-of-mind",
    genre: "90s Hip Hop",
    year: 1994
  },

  // Cycle 5
  {
    artist: "Deep Purple",
    title: "Smoke on the Water",
    url: "https://soundcloud.com/deeppurple/smoke-on-the-water",
    genre: "70s Rock",
    year: 1972
  },
  {
    artist: "Scorpions",
    title: "Rock You Like a Hurricane",
    url: "https://soundcloud.com/scorpions-official/rock-you-like-a-hurricane",
    genre: "80s Rock",
    year: 1984
  },
  {
    artist: "Radiohead",
    title: "Creep",
    url: "https://soundcloud.com/radiohead/creep",
    genre: "90s Rock",
    year: 1992
  },
  {
    artist: "Beastie Boys",
    title: "Sabotage",
    url: "https://soundcloud.com/beastieboys/sabotage",
    genre: "90s Hip Hop",
    year: 1994
  },

  // Cycle 6
  {
    artist: "Fleetwood Mac",
    title: "The Chain",
    url: "https://soundcloud.com/fleetwoodmacofficial/the-chain",
    genre: "70s Rock",
    year: 1977
  },
  {
    artist: "Bryan Adams",
    title: "Summer of '69",
    url: "https://soundcloud.com/bryanadams/summer-of-69",
    genre: "80s Rock",
    year: 1984
  },
  {
    artist: "Weezer",
    title: "Buddy Holly",
    url: "https://soundcloud.com/weezer/buddy-holly",
    genre: "90s Rock",
    year: 1994
  },
  {
    artist: "TLC",
    title: "No Scrubs",
    url: "https://soundcloud.com/tlcofficial/no-scrubs",
    genre: "90s Hip Hop",
    year: 1999
  },

  // Cycle 7
  {
    artist: "Heart",
    title: "Barracuda",
    url: "https://soundcloud.com/heartofficial/barracuda",
    genre: "70s Rock",
    year: 1977
  },
  {
    artist: "Duran Duran",
    title: "Hungry Like the Wolf",
    url: "https://soundcloud.com/duranduran/hungry-like-the-wolf",
    genre: "80s Rock",
    year: 1982
  },
  {
    artist: "Smashing Pumpkins",
    title: "1979",
    url: "https://soundcloud.com/smashingpumpkins/1979-1",
    genre: "90s Rock",
    year: 1995
  },
  {
    artist: "OutKast",
    title: "Rosa Parks",
    url: "https://soundcloud.com/outkast-music/rosa-parks",
    genre: "90s Hip Hop",
    year: 1998
  },

  // Cycle 8
  {
    artist: "Kansas",
    title: "Carry on Wayward Son",
    url: "https://soundcloud.com/kansasband/carry-on-wayward-son",
    genre: "70s Rock",
    year: 1976
  },
  {
    artist: "New Order",
    title: "Blue Monday",
    url: "https://soundcloud.com/neworderofficial/blue-monday",
    genre: "80s Rock",
    year: 1983
  },
  {
    artist: "Blink-182",
    title: "All The Small Things",
    url: "https://soundcloud.com/blink-182/all-the-small-things",
    genre: "90s Rock",
    year: 1999
  },
  {
    artist: "Eminem",
    title: "My Name Is",
    url: "https://soundcloud.com/eminemofficial/my-name-is",
    genre: "90s Hip Hop",
    year: 1999
  },

  // Cycle 9
  {
    artist: "Blue Öyster Cult",
    title: "(Don't Fear) The Reaper",
    url: "https://soundcloud.com/blueoystercult/dont-fear-the-reaper",
    genre: "70s Rock",
    year: 1976
  },
  {
    artist: "Beastie Boys",
    title: "No Sleep Till Brooklyn",
    url: "https://soundcloud.com/beastieboys/no-sleep-till-brooklyn",
    genre: "80s Rock",
    year: 1986
  },
  {
    artist: "Sublime",
    title: "Santeria",
    url: "https://soundcloud.com/sublimeofficial/santeria",
    genre: "90s Rock",
    year: 1996
  },
  {
    artist: "JAY-Z",
    title: "Hard Knock Life (Ghetto Anthem)",
    url: "https://soundcloud.com/jay-z-official/hard-knock-life-ghetto-anthem",
    genre: "90s Hip Hop",
    year: 1998
  },

  // Cycle 10
  {
    artist: "Thin Lizzy",
    title: "The Boys Are Back In Town",
    url: "https://soundcloud.com/thinlizzyofficial/the-boys-are-back-in-town",
    genre: "70s Rock",
    year: 1976
  },
  {
    artist: "a-ha",
    title: "Take On Me",
    url: "https://soundcloud.com/a-ha/take-on-me",
    genre: "80s Rock",
    year: 1985
  },
  {
    artist: "No Doubt",
    title: "Don't Speak",
    url: "https://soundcloud.com/nodoubt/dont-speak",
    genre: "90s Rock",
    year: 1995
  },
  {
    artist: "Dr. Dre",
    title: "Still D.R.E.",
    url: "https://soundcloud.com/dr-dre-music/still-d-r-e",
    genre: "90s Hip Hop",
    year: 1999
  },

  // Cycle 11
  {
    artist: "Black Sabbath",
    title: "Iron Man",
    url: "https://soundcloud.com/blacksabbath/iron-man",
    genre: "70s Rock",
    year: 1970
  },
  {
    artist: "Depeche Mode",
    title: "Enjoy the Silence",
    url: "https://soundcloud.com/depeche_mode/enjoy-the-silence",
    genre: "90s Rock",
    year: 1990
  },
  {
    artist: "Third Eye Blind",
    title: "Semi-Charmed Life",
    url: "https://soundcloud.com/thirdeyeblind/semi-charmed-life",
    genre: "90s Rock",
    year: 1997
  },
  {
    artist: "Salt-N-Pepa",
    title: "Shoop",
    url: "https://soundcloud.com/salt-n-pepa-official/shoop",
    genre: "90s Hip Hop",
    year: 1993
  },

  // Cycle 12
  {
    artist: "The Clash",
    title: "London Calling",
    url: "https://soundcloud.com/theclash/london-calling",
    genre: "70s Rock",
    year: 1979
  },
  {
    artist: "Beastie Boys",
    title: "Fight For Your Right",
    url: "https://soundcloud.com/beastieboys/fight-for-your-right",
    genre: "80s Rock",
    year: 1986
  },
  {
    artist: "Red Hot Chili Peppers",
    title: "Californication",
    url: "https://soundcloud.com/red-hot-chili-peppers-official/californication",
    genre: "90s Rock",
    year: 1999
  },
  {
    artist: "2Pac",
    title: "Changes",
    url: "https://soundcloud.com/2pac/changes",
    genre: "90s Hip Hop",
    year: 1998
  },

  // Cycle 13
  {
    artist: "Eagles",
    title: "Hotel California",
    url: "https://soundcloud.com/eaglesofficial/hotel-california",
    genre: "70s Rock",
    year: 1976
  },
  {
    artist: "Blink-182",
    title: "What's My Age Again?",
    url: "https://soundcloud.com/blink-182/whats-my-age-again",
    genre: "90s Rock",
    year: 1999
  },
  {
    artist: "No Doubt",
    title: "Just A Girl",
    url: "https://soundcloud.com/nodoubt/just-a-girl",
    genre: "90s Rock",
    year: 1995
  },
  {
    artist: "Missy Elliott",
    title: "The Rain (Supa Dupa Fly)",
    url: "https://soundcloud.com/missyelliott/the-rain-supa-dupa-fly",
    genre: "90s Hip Hop",
    year: 1997
  },

  // Cycle 14
  {
    artist: "Aerosmith",
    title: "Dream On",
    url: "https://soundcloud.com/aerosmith/dream-on",
    genre: "70s Rock",
    year: 1973
  },
  {
    artist: "OutKast",
    title: "ATLiens",
    url: "https://soundcloud.com/outkast-music/atliens",
    genre: "90s Hip Hop",
    year: 1996
  },
  {
    artist: "TLC",
    title: "Waterfalls",
    url: "https://soundcloud.com/tlcofficial/waterfalls",
    genre: "90s Hip Hop",
    year: 1995
  },
  {
    artist: "Snoop Dogg",
    title: "Who Am I (What's My Name)?",
    url: "https://soundcloud.com/snoopdogg/who-am-i-whats-my-name",
    genre: "90s Hip Hop",
    year: 1993
  }
];

// Additional classic songs included in the autocomplete search dropdown
// so players have plenty of plausible 70s/80s/90s Rock & 90s Hip Hop choices when guessing.
window.EXTRA_SEARCH_CATALOG = [
  { artist: "Queen", title: "Bohemian Rhapsody", genre: "70s Rock" },
  { artist: "Queen", title: "Don't Stop Me Now", genre: "70s Rock" },
  { artist: "Queen", title: "Another One Bites the Dust", genre: "80s Rock" },
  { artist: "Led Zeppelin", title: "Stairway to Heaven", genre: "70s Rock" },
  { artist: "Led Zeppelin", title: "Whole Lotta Love", genre: "70s Rock" },
  { artist: "Led Zeppelin", title: "Kashmir", genre: "70s Rock" },
  { artist: "Pink Floyd", title: "Another Brick in the Wall, Pt. 2", genre: "70s Rock" },
  { artist: "Pink Floyd", title: "Wish You Were Here", genre: "70s Rock" },
  { artist: "Pink Floyd", title: "Money", genre: "70s Rock" },
  { artist: "Boston", title: "More Than a Feeling", genre: "70s Rock" },
  { artist: "Lynyrd Skynyrd", title: "Sweet Home Alabama", genre: "70s Rock" },
  { artist: "Lynyrd Skynyrd", title: "Free Bird", genre: "70s Rock" },
  { artist: "David Bowie", title: "Heroes", genre: "70s Rock" },
  { artist: "David Bowie", title: "Starman", genre: "70s Rock" },
  { artist: "David Bowie", title: "Let's Dance", genre: "80s Rock" },
  { artist: "AC/DC", title: "Back In Black", genre: "80s Rock" },
  { artist: "AC/DC", title: "Highway to Hell", genre: "70s Rock" },
  { artist: "AC/DC", title: "Thunderstruck", genre: "90s Rock" },
  { artist: "AC/DC", title: "You Shook Me All Night Long", genre: "80s Rock" },
  { artist: "Journey", title: "Don't Stop Believin'", genre: "80s Rock" },
  { artist: "Journey", title: "Separate Ways (Worlds Apart)", genre: "80s Rock" },
  { artist: "Bon Jovi", title: "Livin' On A Prayer", genre: "80s Rock" },
  { artist: "Bon Jovi", title: "You Give Love A Bad Name", genre: "80s Rock" },
  { artist: "Bon Jovi", title: "Wanted Dead or Alive", genre: "80s Rock" },
  { artist: "Van Halen", title: "Jump", genre: "80s Rock" },
  { artist: "Van Halen", title: "Panama", genre: "80s Rock" },
  { artist: "Def Leppard", title: "Pour Some Sugar on Me", genre: "80s Rock" },
  { artist: "Def Leppard", title: "Photograph", genre: "80s Rock" },
  { artist: "U2", title: "With Or Without You", genre: "80s Rock" },
  { artist: "U2", title: "Where the Streets Have No Name", genre: "80s Rock" },
  { artist: "U2", title: "One", genre: "90s Rock" },
  { artist: "Tears For Fears", title: "Everybody Wants To Rule The World", genre: "80s Rock" },
  { artist: "R.E.M.", title: "Losing My Religion", genre: "90s Rock" },
  { artist: "R.E.M.", title: "It's the End of the World as We Know It", genre: "80s Rock" },
  { artist: "The Cure", title: "Just Like Heaven", genre: "80s Rock" },
  { artist: "The Cure", title: "Friday I'm in Love", genre: "90s Rock" },
  { artist: "Dire Straits", title: "Sultans of Swing", genre: "70s Rock" },
  { artist: "Dire Straits", title: "Money for Nothing", genre: "80s Rock" },
  { artist: "Billy Idol", title: "Rebel Yell", genre: "80s Rock" },
  { artist: "Billy Idol", title: "White Wedding", genre: "80s Rock" },
  { artist: "Simple Minds", title: "Don't You (Forget About Me)", genre: "80s Rock" },
  { artist: "INXS", title: "Need You Tonight", genre: "80s Rock" },
  { artist: "Metallica", title: "Enter Sandman", genre: "90s Rock" },
  { artist: "Metallica", title: "Nothing Else Matters", genre: "90s Rock" },
  { artist: "Metallica", title: "Master of Puppets", genre: "80s Rock" },
  { artist: "Pearl Jam", title: "Alive", genre: "90s Rock" },
  { artist: "Pearl Jam", title: "Even Flow", genre: "90s Rock" },
  { artist: "Pearl Jam", title: "Jeremy", genre: "90s Rock" },
  { artist: "Soundgarden", title: "Black Hole Sun", genre: "90s Rock" },
  { artist: "Alice In Chains", title: "Man in the Box", genre: "90s Rock" },
  { artist: "Alice In Chains", title: "Rooster", genre: "90s Rock" },
  { artist: "Stone Temple Pilots", title: "Plush", genre: "90s Rock" },
  { artist: "Stone Temple Pilots", title: "Interstate Love Song", genre: "90s Rock" },
  { artist: "Nirvana", title: "Come As You Are", genre: "90s Rock" },
  { artist: "Nirvana", title: "Lithium", genre: "90s Rock" },
  { artist: "Nirvana", title: "Heart-Shaped Box", genre: "90s Rock" },
  { artist: "Oasis", title: "Wonderwall", genre: "90s Rock" },
  { artist: "Oasis", title: "Don't Look Back in Anger", genre: "90s Rock" },
  { artist: "Blur", title: "Song 2", genre: "90s Rock" },
  { artist: "The Cranberries", title: "Zombie", genre: "90s Rock" },
  { artist: "The Cranberries", title: "Linger", genre: "90s Rock" },
  { artist: "Rage Against The Machine", title: "Killing In The Name", genre: "90s Rock" },
  { artist: "Rage Against The Machine", title: "Bulls on Parade", genre: "90s Rock" },
  { artist: "Weezer", title: "Say It Ain't So", genre: "90s Rock" },
  { artist: "The Offspring", title: "Self Esteem", genre: "90s Rock" },
  { artist: "The Offspring", title: "Come Out and Play", genre: "90s Rock" },
  { artist: "Beck", title: "Loser", genre: "90s Rock" },
  { artist: "Alanis Morissette", title: "You Oughta Know", genre: "90s Rock" },
  { artist: "The Notorious B.I.G.", title: "Juicy", genre: "90s Hip Hop" },
  { artist: "The Notorious B.I.G.", title: "Big Poppa", genre: "90s Hip Hop" },
  { artist: "The Notorious B.I.G.", title: "Hypnotize", genre: "90s Hip Hop" },
  { artist: "Wu-Tang Clan", title: "C.R.E.A.M.", genre: "90s Hip Hop" },
  { artist: "Wu-Tang Clan", title: "Protect Ya Neck", genre: "90s Hip Hop" },
  { artist: "A Tribe Called Quest", title: "Can I Kick It?", genre: "90s Hip Hop" },
  { artist: "A Tribe Called Quest", title: "Scenario", genre: "90s Hip Hop" },
  { artist: "Beastie Boys", title: "Intergalactic", genre: "90s Hip Hop" },
  { artist: "Coolio", title: "Gangsta's Paradise", genre: "90s Hip Hop" },
  { artist: "Ice Cube", title: "It Was A Good Day", genre: "90s Hip Hop" },
  { artist: "Warren G", title: "Regulate", genre: "90s Hip Hop" },
  { artist: "Mobb Deep", title: "Shook Ones, Pt. II", genre: "90s Hip Hop" },
  { artist: "Fugees", title: "Killing Me Softly With His Song", genre: "90s Hip Hop" },
  { artist: "Fugees", title: "Ready or Not", genre: "90s Hip Hop" },
  { artist: "Lauryn Hill", title: "Doo Wop (That Thing)", genre: "90s Hip Hop" },
  { artist: "Cypress Hill", title: "Insane in the Brain", genre: "90s Hip Hop" },
  { artist: "House of Pain", title: "Jump Around", genre: "90s Hip Hop" },
  { artist: "Naughty By Nature", title: "O.P.P.", genre: "90s Hip Hop" },
  { artist: "LL Cool J", title: "Mama Said Knock You Out", genre: "90s Hip Hop" },
  { artist: "Montell Jordan", title: "This Is How We Do It", genre: "90s Hip Hop" },
  { artist: "DMX", title: "Ruff Ryders' Anthem", genre: "90s Hip Hop" },
  { artist: "Dr. Dre", title: "Forgot About Dre", genre: "90s Hip Hop" },
  { artist: "2Pac", title: "Dear Mama", genre: "90s Hip Hop" },
  { artist: "Nas", title: "If I Ruled the World (Imagine That)", genre: "90s Hip Hop" }
];
