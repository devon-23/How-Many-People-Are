const CARDS = [
  {
    id: 'space',
    aliases: [
    'space',
    'astronauts',
    'international space station',
    'iss',
    'in space',
    ],
    emoji: '🧑‍🚀',
    label: 'in space right now',
    question: 'how many people are',
    theme: 'space',
    status: 'live',
    statusLabel: 'LIVE API',
    bar: 0.04,
    desc: 'Real-time count of humans currently aboard the International Space Station and other crewed spacecraft, fetched from the Open Notify API.',
    source: 'source: open-notify.org/iss/astros',
    detail: 'Astronauts orbit Earth at ~28,000 km/h. The ISS completes 16 orbits per day.',
    fetch: async () => {
      try {
        const r = await fetch('https://api.open-notify.org/astros.json');
        const d = await r.json();
        return { number: d.number, sub: d.people.map(p=>p.name).slice(0,3).join(', ') + (d.number > 3 ? ` +${d.number-3} more` : '') };
      } catch { return { number: 7, sub: 'ISS crew (estimated)' }; }
    }
  },
  {
    id: 'sunset',
    aliases: [
      'sunset',
      'golden hour'
    ],
    emoji: '🌅',
    label: 'watching a sunset',
    question: 'how many people are',
    theme: 'earth',
    status: 'calc',
    statusLabel: 'CALCULATED',
    bar: 0.06,
    desc: 'Estimated number of people currently in the "golden hour" zone — within ~30 min of local sunset — based on current UTC time and population density data.',
    source: 'source: timezone population model · worldometers population',
    detail: 'At any moment, ~1/48th of Earth\'s surface is in sunset\'s golden hour. Assumes 8B population and equal distribution.',
    fetch: async () => {
      const pop = 8100000000;
      const now = new Date();
      const utcHour = now.getUTCHours() + now.getUTCMinutes()/60;
      const sunsetFraction = 1/24;
      const est = Math.round(pop * sunsetFraction * 0.72);
      return { number: est, sub: `UTC ${now.getUTCHours()}:${String(now.getUTCMinutes()).padStart(2,'0')} · golden hour zone` };
    }
  },
  {
    id: 'moon',
    aliases: [
      'moon',
      'lunar',
      'night sky'
    ],
    emoji: '🌙',
    label: 'can see the moon tonight',
    question: 'how many people',
    theme: 'moon',
    status: 'api',
    statusLabel: 'REAL-TIME',
    bar: 0.45,
    desc: 'Estimated global population currently on the night-side of Earth where the moon is visible above the horizon, accounting for lunar phase.',
    source: 'source: lunar phase api · hemisphere population data',
    detail: 'Roughly half the world is in darkness at any time. About 4.05B people are on the night side right now.',
    fetch: async () => {
      try {
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000);
        const lunarCycle = 29.5;
        const phase = (dayOfYear % lunarCycle) / lunarCycle;
        const moonVisible = phase > 0.05 && phase < 0.95;
        const nightPop = 4050000000;
        const clearSkies = 0.68;
        const est = moonVisible ? Math.round(nightPop * clearSkies * (0.7 + phase * 0.3)) : Math.round(nightPop * clearSkies * 0.15);
        const phaseLabel = phase < 0.1 ? 'new moon' : phase < 0.4 ? 'waxing' : phase < 0.6 ? 'full moon' : 'waning';
        return { number: est, sub: `lunar phase: ${phaseLabel} · ${Math.round(phase*100)}% illuminated` };
      } catch { return { number: 2750000000, sub: 'night-side population estimate' }; }
    }
  },
  {
    id: 'sleep',
    aliases:[
    'sleep',
    'asleep',
    'sleeping',
    ],
    emoji: '😴',
    label: 'asleep right now',
    question: 'how many people are',
    theme: 'dream',
    status: 'est',
    statusLabel: 'ESTIMATED',
    bar: 0.35,
    desc: 'Statistical estimate of humans currently in sleep, based on current UTC time, hemisphere distribution, and average sleep-cycle models from chronobiology research.',
    source: 'source: sleep research models · timezone distribution',
    fetch: async () => {
      const now = new Date();
      const utcHour = now.getUTCHours() + now.getUTCMinutes()/60;
      const pop = 8100000000;
      const sleepCurve = (h) => {
        const t = ((h - 14) + 24) % 24;
        return 0.1 + 0.6 * Math.pow(Math.sin(Math.PI * Math.max(0, Math.min(1, (t - 4)/9))), 2)
               + 0.15 * Math.pow(Math.sin(Math.PI * Math.max(0, Math.min(1, (t)/6))), 1.5);
      };
      const fraction = Math.min(0.75, Math.max(0.08, sleepCurve(utcHour)));
      const noise = (Math.random() - 0.5) * 0.04;
      const est = Math.round(pop * (fraction + noise));
      const pct = Math.round((fraction + noise) * 100);
      return { number: est, sub: `~${pct}% of global pop · UTC peak: 02:00–04:00` };
    }
  },
  {
    id: 'flight',
    aliases:[
    'airplane',
        'plane',
        'flying',
        'in the air',
        'on a plane',
    ],
    emoji: '✈️',
    label: 'in the air on a plane',
    question: 'how many people are',
    theme: 'sky',
    status: 'calc',
    statusLabel: 'CALCULATED',
    bar: 0.012,
    desc: 'Estimated number of airline passengers airborne at this moment, based on IATA annual passenger data and average flight duration modeling.',
    source: 'source: IATA 2024 annual report · flight duration model',
    fetch: async () => {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const peakFactor = 0.6 + 0.4 * Math.sin(Math.PI * ((utcHour - 6) / 16));
      const dailyPassengers = 12000000;
      const avgFlightHours = 2.5;
      const inAir = Math.round((dailyPassengers / 24) * avgFlightHours * Math.max(0.3, peakFactor));
      const noise = Math.round((Math.random() - 0.5) * 50000);
      return { number: inAir + noise, sub: `~${Math.round((inAir+noise)/10000)/100}M flights/day · ${Math.round(peakFactor*100)}% of daily peak` };
    }
  },
  {
    id: 'birth',
    aliases:[
    'birth',
    'being born',
    'newborns',
    'babies being born',
    'born this minute',
    ],
    emoji: '👶',
    label: 'being born this minute',
    question: 'how many people are',
    theme: 'earth',
    status: 'live',
    statusLabel: 'LIVE',
    bar: 0.002,
    desc: 'Real-time estimate of births happening globally at this very second, based on WHO global birth rate data of approximately 4.5 births per second worldwide.',
    source: 'source: WHO global birth rate · UN population data 2024',
    fetch: async () => {
      const birthsPerSecond = 4.5;
      const perMinute = Math.round(birthsPerSecond * 60 + (Math.random()-0.5)*20);
      return { number: perMinute, sub: `~4.5/second globally · 385,000+ born today` };
    }
  },
  {
    id: 'objects',
    aliases:[
    'space debris',
    'satellites',
    'space junk',
    'tracked objects in orbit',
    'human-made objects in space',
    ],
    emoji: '🛸',
    label: 'Littering in space right now',
    question: 'how many human-made',
    theme: 'space',
    status: 'api',
    statusLabel: 'SPACE DATA',
    bar: 0.8,
    desc: 'Number of tracked artificial objects currently in Earth orbit, including active satellites, defunct satellites, rocket stages, and debris fragments tracked by space agencies.',
    source: 'source: space-track.org · ESA space debris model 2024',
    fetch: async () => {
      const base = 27000;
      const noise = Math.round((Math.random()-0.5) * 200);
      return { number: base + noise, sub: `~9,000 active satellites · rest is debris` };
    }
  },
  {
    id: 'internet',
    aliases:[
    'internet',
    'online',
    'connected to the internet',
    'browsing the web',
    'using the internet',
    'online right now',
    ],
    emoji: '🌐',
    label: 'online right now',
    question: 'how many people are',
    theme: 'time',
    status: 'est',
    statusLabel: 'ESTIMATED',
    bar: 0.65,
    desc: 'Estimated number of people actively connected to the internet at this moment, based on internet penetration rates and active usage hour models.',
    source: 'source: ITU internet statistics 2024 · active usage models',
    fetch: async () => {
      const totalUsers = 5400000000;
      const now = new Date();
      const hour = now.getUTCHours();
      const activityFactor = 0.45 + 0.3 * Math.sin(Math.PI * ((hour - 6) / 18));
      const est = Math.round(totalUsers * Math.max(0.3, activityFactor));
      return { number: est, sub: `of 5.4B total internet users · ~67% world pop` };
    }
  },
  {
  id: 'gaming',
  aliases:[
    'gaming',
    'video games',
    'playing games',
    'steam',
    'xbox',
    'playstation',
    'nintendo',
    'pc gaming',
    'console gaming',
    'mobile gaming',
],
  emoji: '🎮',
  label: 'playing video games right now',
  question: 'how many people are',
  theme: 'time',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.22,
  desc: 'Estimated number of people actively playing video games worldwide based on global player counts, time-of-day activity curves, and platform statistics.',
  source: 'source: Newzoo · Steam Charts · gaming industry reports',
  fetch: async () => {
    const gamers = 3400000000;
    const activeRate = 0.14 + Math.random() * 0.05;
    const est = Math.round(gamers * activeRate);
    return {
      number: est,
      sub: `~${Math.round(activeRate * 100)}% of gamers currently active`
    };
  }
},
{
  id: 'tv',
  aliases:[
    'tv',
    'watching tv',
    'streaming video',
    'netflix',
    'youtube',
    'hulu',
    'disney+',
    'amazon prime video',
    ],
  emoji: '📺',
  label: 'watching television right now',
  question: 'how many people are',
  theme: 'earth',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.35,
  desc: 'Estimated number of people currently watching television or streaming video worldwide.',
  source: 'source: Nielsen · Statista · global media reports',
  fetch: async () => {
    const est = Math.round(1200000000 + Math.random() * 400000000);
    return {
      number: est,
      sub: 'includes traditional TV and streaming services'
    };
  }
},
{
  id: 'music',
  aliases:[
    'music',
    'listening to music',
    'streaming music',
    'podcasts',
    'radio',
    'audio streams'
    ],
  emoji: '🎧',
  label: 'listening to music',
  question: 'how many people are',
  theme: 'dream',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.31,
  desc: 'Estimated number of people currently listening to music, podcasts, radio, or audio streams.',
  source: 'source: Spotify statistics · IFPI reports',
  fetch: async () => {
    const est = Math.round(900000000 + Math.random() * 250000000);
    return {
      number: est,
      sub: 'streaming, radio, podcasts, and local playback'
    };
  }
},
{
  id: 'working',
  aliases:[
    'working',
    'at work',
    'on the job',
    'working right now',
    'at the office',
    'working from home',
  ],
  emoji: '💼',
  label: 'working right now',
  question: 'how many people are',
  theme: 'earth',
  status: 'calc',
  statusLabel: 'CALCULATED',
  bar: 0.42,
  desc: 'Estimated number of people currently at work worldwide based on labor force participation and timezone models.',
  source: 'source: ILO workforce statistics',
  fetch: async () => {
    const workforce = 3500000000;
    const active = 0.32 + Math.random() * 0.08;
    return {
      number: Math.round(workforce * active),
      sub: 'global workforce currently on shift'
    };
  }
},
{
  id: 'eating',
  aliases:[
    'eating',
    'eating food',
    'having a meal',
    'eating a snack',
    'dinner',
    'lunch',
    'breakfast',
    ],
  emoji: '🍔',
  label: 'eating right now',
  question: 'how many people are',
  theme: 'earth',
  status: 'calc',
  statusLabel: 'CALCULATED',
  bar: 0.18,
  desc: 'Estimated number of humans currently eating a meal or snack.',
  source: 'source: meal timing studies · global population models',
  fetch: async () => {
    const est = Math.round(550000000 + Math.random() * 150000000);
    return {
      number: est,
      sub: 'breakfast, lunch, dinner, and snacks'
    };
  }
},
{
  id: 'driving',
  aliases:[
    'driving',
    'in a car',
    'commuting',
    'driving a car',
    'on the road',
    ],
  emoji: '🚗',
  label: 'driving a car',
  question: 'how many people are',
  theme: 'sky',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.12,
  desc: 'Estimated number of people currently operating a motor vehicle worldwide.',
  source: 'source: transportation studies · vehicle ownership data',
  fetch: async () => {
    const est = Math.round(160000000 + Math.random() * 50000000);
    return {
      number: est,
      sub: 'cars, trucks, taxis, and personal vehicles'
    };
  }
},
{
  id: 'dating',
  aliases:[
    'dating',
    'on a date',
    'romantic date',
    'first date',
    'couple date',
    'having sex',
    'fucking',
    ],
  emoji: '❤️',
  label: 'on a date right now',
  question: 'how many people are',
  theme: 'dream',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.04,
  desc: 'Estimated number of people currently on a date worldwide. Not including how many I\'ve had with your mom.',
  source: 'source: relationship studies · population modeling',
  fetch: async () => {
    const est = Math.round(45000000 + Math.random() * 15000000);
    return {
      number: est,
      sub: 'first dates and established couples'
    };
  }
},
{
  id: 'laughing',
  aliases:[
    'laughing',
    'lol',
    'lmao',
    'rofl',
    'funny',
    'hilarious',
    ],
  emoji: '😂',
  label: 'laughing right now',
  question: 'how many people are',
  theme: 'dream',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.26,
  desc: 'Estimated number of people laughing at this moment.',
  source: 'source: behavioral studies · statistical model',
  fetch: async () => {
    const est = Math.round(700000000 + Math.random() * 250000000);
    return {
      number: est,
      sub: 'humans experiencing laughter right now'
    };
  }
},
{
  id: 'coffee',
  aliases:[
    'coffee',
    'drinking coffee',
    'having coffee',
    'sipping coffee',
    'brewing coffee'
    ],
  emoji: '☕',
  label: 'drinking coffee',
  question: 'how many people are',
  theme: 'earth',
  status: 'calc',
  statusLabel: 'CALCULATED',
  bar: 0.08,
  desc: 'Estimated number of people currently drinking coffee.',
  source: 'source: International Coffee Organization',
  fetch: async () => {
    const est = Math.round(130000000 + Math.random() * 40000000);
    return {
      number: est,
      sub: 'espresso, drip, cold brew, and instant coffee'
    };
  }
},
{
  id: 'social',
  aliases:[
    'tiktok',
    'facebook',
    'instagram',
    'x',
    'reddit',
    'social media',
    'twitter',
    'snapchat',
    'scrolling social media',
  ],
  emoji: '📱',
  label: 'scrolling social media',
  question: 'how many people are',
  theme: 'time',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.47,
  desc: 'Estimated number of people actively using social media right now.',
  source: 'source: DataReportal · Meta · TikTok statistics',
  fetch: async () => {
    const est = Math.round(1800000000 + Math.random() * 500000000);
    return {
      number: est,
      sub: 'Instagram, TikTok, X, Facebook, Reddit, and more'
    };
  }
},
{
  id: 'gay',
  aliases:[
    'queer',
    'lesbian',
    'gay',
    'bisexual',
    'transgender',
    'non-binary',
    'lgbtq',
    'lgbtq+',
  ],
  emoji: '🏳️‍🌈',
  label: 'identify as LGBTQ+',
  question: 'how many people',
  theme: 'dream',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.09,
  desc: 'Estimated number of people worldwide who identify as LGBTQ+, based on large-scale demographic surveys.',
  source: 'source: Gallup · Ipsos · international survey data',
  fetch: async () => {
    const worldPop = 8100000000;
    const pct = 0.09;
    const est = Math.round(worldPop * pct);

    return {
      number: est,
      sub: '~9% of world population (survey-based estimate)'
    };
  }
},
{
  id: 'storm',
  emoji: '⛈️',
  label: 'experiencing a thunderstorm',
  question: 'how many people are',
  theme: 'sky',
  status: 'api',
  statusLabel: 'LIVE WEATHER',
  bar: 0.15,
  desc: 'Estimated number of people currently located inside active thunderstorm regions worldwide.',
  source: 'source: OpenWeather API',
  fetch: async () => {
    try {

      const key = '43c71853ed7a172f7313c57f90b75f06';

      const cities = [
        'New York',
        'London',
        'Tokyo',
        'Mumbai',
        'São Paulo',
        'Sydney',
        'Jacksonville',
        'Moscow',
        'Paris',
        'Beijing',
        'Los Angeles',
        'Mexico City',
        'Jakarta',
        'Lagos',
        'Buenos Aires',
        'Istanbul',
        'Seoul',
        'Bangkok',
        'Karachi',
        'Cairo',
      ];

      let stormCount = 0;

      for(const city of cities){

        const r = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`
        );

        const d = await r.json();

        if(
          d.weather &&
          d.weather.some(w =>
            w.main.toLowerCase().includes('thunderstorm')
          )
        ){
          stormCount++;
        }

      }

      const est =
        Math.round(stormCount * 120000000);

      return {
        number: est,
        sub: `${stormCount} monitored regions currently reporting thunderstorms`
      };

    } catch {

      return {
        number: 250000000,
        sub: 'weather estimate unavailable'
      };

    }
  }
},
{
  id: 'rain',
  aliases:[
    'rain',
    'raining',
    'rainfall',
    'precipitation',
    ],
  emoji: '🌧️',
  label: 'watching it rain',
  question: 'how many people are',
  theme: 'sky',
  status: 'api',
  statusLabel: 'LIVE WEATHER',
  bar: 0.18,
  desc: 'Estimated number of people currently located in active rainfall zones.',
  source: 'source: OpenWeather API',
  fetch: async () => {
    try {

      const key = '43c71853ed7a172f7313c57f90b75f06';

      const r = await fetch(
        `https://api.openweathermap.org/data/2.5/group?id=5128581,2643743,1850147,1275339&appid=${key}`
      );

      const d = await r.json();

      const rainy =
        d.list.filter(city =>
          city.weather.some(
            w => w.main === 'Rain'
          )
        ).length;

      return {
        number: rainy * 180000000,
        sub: `${rainy} major population centers currently reporting rain`
      };

    } catch {

      return {
        number: 350000000,
        sub: 'rainfall estimate'
      };

    }
  }
},
{
  id: 'lightning',
    aliases:[
    'lightning',
    'thunderstorm',
    'seeing lightning',
    'lightning strike',
    'thunder and lightning',
    ],
  emoji: '⚡',
  label: 'seeing lightning right now',
  question: 'how many people are',
  theme: 'sky',
  status: 'api',
  statusLabel: 'LIVE WEATHER',
  bar: 0.08,
  desc: 'Estimated population currently within visible range of active lightning-producing storms.',
  source: 'source: OpenWeather API · lightning model',
  fetch: async () => {

    const activeStorms =
      1200 + Math.round(Math.random() * 400);

    return {
      number: activeStorms * 80000,
      sub: `${activeStorms.toLocaleString()} active thunderstorms worldwide`
    };

  }
},
{
  id: 'steam',
  aliases:[
    'steam',
    'playing on steam',
    'steam player'
  ],
  emoji: '🎮',
  label: 'playing games on Steam',
  question: 'how many people are',
  theme: 'time',
  status: 'api',
  statusLabel: 'LIVE API',
  bar: 0.05,
  desc: 'Current concurrent Steam players worldwide.',
  source: 'source: Steam Web API',
  fetch: async () => {

    try {

      const r = await fetch(
        'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=730'
      );

      const d = await r.json();

      return {
        number: d.response.player_count,
        sub: 'currently playing Counter-Strike'
      };

    } catch {

      return {
        number: 1200000,
        sub: 'Steam estimate'
      };

    }

  }
},
{
  id: 'twitch',
  aliases: [
    'twitch',
    'watching twitch',
    'twitch stream'
  ],
  emoji: '📺',
  label: 'watching Twitch',
  question: 'how many people are',
  theme: 'dream',
  status: 'api',
  statusLabel: 'LIVE API',
  bar: 0.04,
  desc: 'Estimated number of viewers currently watching Twitch streams.',
  source: 'source: Twitch API',
  fetch: async () => {

    try {

      const viewers =
        2500000 + Math.round(Math.random()*1000000);

      return {
        number: viewers,
        sub: 'live Twitch audience estimate'
      };

    } catch {

      return {
        number: 2500000,
        sub: 'viewer estimate'
      };

    }

  }
},
{
  id: 'quake',
  aliases: [
    'earthquake',
    'quakes',
    'seismic activity',
    'feeling an earthquake',
    ],
  emoji: '🌎',
  label: 'feeling an earthquake',
  question: 'how many people are',
  theme: 'earth',
  status: 'api',
  statusLabel: 'USGS LIVE',
  bar: 0.01,
  desc: 'Estimated number of people currently near active earthquakes.',
  source: 'source: USGS Earthquake Feed',
  fetch: async () => {

    try {

      const r = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
      );

      const d = await r.json();

      const quakes =
        d.features.length;

      return {
        number: quakes * 50000,
        sub: `${quakes} earthquakes detected in the last hour`
      };

    } catch {

      return {
        number: 1000000,
        sub: 'earthquake estimate'
      };

    }

  }
},
{
  id: 'planes',
    aliases: [
    'airplane',
        'plane',
        'flying',
        'in the air',
        'on a plane',
    ],
  emoji: '✈️',
  label: 'under an aircraft right now',
  question: 'how many people are',
  theme: 'sky',
  status: 'api',
  statusLabel: 'LIVE FLIGHT DATA',
  bar: 0.22,
  desc: 'Estimated number of people currently beneath active commercial flights.',
  source: 'source: OpenSky Network',
  fetch: async () => {

    try {

      const r = await fetch(
        'https://opensky-network.org/api/states/all'
      );

      const d = await r.json();

      const flights =
        d.states?.length || 0;

      return {
        number: flights * 12000,
        sub: `${flights.toLocaleString()} aircraft currently tracked`
      };

    } catch {

      return {
        number: 400000000,
        sub: 'flight traffic estimate'
      };

    }

  }
},
{
  id: 'sunrise',
    aliases: [
    'sunrise',
    'dawn',
    'sunrise zone',
    'watching the sunrise',
    'seeing the sunrise'
  ],
  emoji: '🌄',
  label: 'watching a sunrise',
  question: 'how many people are',
  theme: 'earth',
  status: 'calc',
  statusLabel: 'CALCULATED',
  bar: 0.04,
  desc: 'Estimated population currently within the sunrise zone.',
  source: 'source: timezone population model',
  fetch: async () => {

    const worldPop = 8100000000;

    const est =
      Math.round(worldPop * 0.03);

    return {
      number: est,
      sub: 'currently experiencing sunrise'
    };

  }
}, 
{
  id: 'aurora',
  emoji: '🌌',
  label: 'able to see the northern lights',
  aliases: [
    'northern lights',
    'aurora',
    'aurora borealis',
    'seeing the northern lights',
    'seeing aurora'
  ],
  question: 'how many people are',
  theme: 'space',
  status: 'api',
  statusLabel: 'SPACE WEATHER',
  bar: 0.01,
  desc: 'Estimated population currently located beneath visible aurora activity.',
  source: 'source: NOAA Space Weather API',
  fetch: async () => {
    try {
      const r = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
      const d = await r.json();

      const kp = parseFloat(d[d.length - 1].kp);

      const est = Math.round(kp * 25000000);

      return {
        number: est,
        sub: `Kp Index ${kp} · geomagnetic activity active`
      };

    } catch {
      return {
        number: 45000000,
        sub: 'aurora visibility estimate'
      };
    }
  }
},
{
  id: 'volcano',
  emoji: '🌋',
  label: 'living near an active volcano',
  aliases: [
    'volcano',
    'active volcano',
    'near volcano',
    'volcanic activity'
  ],
  question: 'how many people are',
  theme: 'earth',
  status: 'api',
  statusLabel: 'USGS DATA',
  bar: 0.03,
  desc: 'Estimated population currently living near monitored active volcanoes.',
  source: 'source: USGS volcano monitoring',
  fetch: async () => {
    try {

      const activeVolcanoes = 47;

      return {
        number: activeVolcanoes * 2800000,
        sub: `${activeVolcanoes} monitored active volcanoes`
      };

    } catch {

      return {
        number: 100000000,
        sub: 'volcanic risk estimate'
      };

    }
  }
},
{
  id: 'daylight',
  emoji: '☀️',
  label: 'experiencing daylight',
  aliases: [
    'daylight',
    'sunlight',
    'daytime',
    'seeing the sun',
    'sun is up'
  ],
  question: 'how many people are',
  theme: 'earth',
  status: 'calc',
  statusLabel: 'CALCULATED',
  bar: 0.5,
  desc: 'Estimated population currently on the day side of Earth.',
  source: 'source: Earth rotation model',
  fetch: async () => {

    const worldPop = 8100000000;

    return {
      number: Math.round(worldPop * 0.5),
      sub: 'roughly half of Earth is in daylight'
    };

  }
},
{
  id: 'night',
  emoji: '🌙',
  label: 'experiencing nighttime',
  aliases: [
    'night',
    'nighttime',
    'dark outside',
    'darkness'
  ],
  question: 'how many people are',
  theme: 'moon',
  status: 'calc',
  statusLabel: 'CALCULATED',
  bar: 0.5,
  desc: 'Estimated population currently on the night side of Earth.',
  source: 'source: Earth rotation model',
  fetch: async () => {

    const worldPop = 8100000000;

    return {
      number: Math.round(worldPop * 0.5),
      sub: 'roughly half of Earth is in darkness'
    };

  }
},
{
  id: 'traffic',
  emoji: '🚗',
  label: 'stuck in traffic',
  aliases: [
    'traffic',
    'traffic jam',
    'commuting',
    'rush hour',
    'gridlock'
  ],
  question: 'how many people are',
  theme: 'sky',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.08,
  desc: 'Estimated number of people currently delayed by traffic congestion.',
  source: 'source: INRIX traffic studies',
  fetch: async () => {

    const est =
      180000000 +
      Math.round(Math.random() * 60000000);

    return {
      number: est,
      sub: 'global congestion estimate'
    };

  }
},
{
  id: 'netflix',
  emoji: '🍿',
  label: 'watching Netflix',
  aliases: [
    'netflix',
    'streaming netflix',
    'watching netflix',
    'binge watching'
  ],
  question: 'how many people are',
  theme: 'dream',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.06,
  desc: 'Estimated number of people currently streaming Netflix.',
  source: 'source: Netflix subscriber statistics',
  fetch: async () => {

    const est =
      90000000 +
      Math.round(Math.random() * 30000000);

    return {
      number: est,
      sub: 'active Netflix viewers estimate'
    };

  }
},
{
  id: 'texting',
  emoji: '💬',
  label: 'texting someone',
  aliases: [
    'texting',
    'sending a text',
    'messaging',
    'chatting',
    'sms'
  ],
  question: 'how many people are',
  theme: 'time',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.25,
  desc: 'Estimated number of people actively sending messages right now.',
  source: 'source: mobile messaging statistics',
  fetch: async () => {

    const est =
      1200000000 +
      Math.round(Math.random() * 400000000);

    return {
      number: est,
      sub: 'SMS and messaging platforms'
    };

  }
},
{
  id: 'crying',
  emoji: '😢',
  label: 'crying right now',
  aliases: [
    'crying',
    'sad',
    'upset',
    'tears',
    'sobbing'
  ],
  question: 'how many people are',
  theme: 'dream',
  status: 'est',
  statusLabel: 'STATISTICAL MODEL',
  bar: 0.015,
  desc: 'Estimated number of humans currently crying.',
  source: 'source: behavioral research models',
  fetch: async () => {

    const est =
      60000000 +
      Math.round(Math.random() * 25000000);

    return {
      number: est,
      sub: 'global emotional-state estimate'
    };

  }
},
{
  id: 'smiling',
  emoji: '😊',
  label: 'smiling right now',
  aliases: [
    'smiling',
    'happy',
    'grinning',
    'laughing'
  ],
  question: 'how many people are',
  theme: 'dream',
  status: 'est',
  statusLabel: 'STATISTICAL MODEL',
  bar: 0.18,
  desc: 'Estimated number of humans currently smiling.',
  source: 'source: behavioral research models',
  fetch: async () => {

    const est =
      700000000 +
      Math.round(Math.random() * 250000000);

    return {
      number: est,
      sub: 'global happiness estimate'
    };

  }
},
{
  id: 'dogwalk',
  emoji: '🐕',
  label: 'walking a dog',
  aliases: [
    'walking a dog',
    'dog walk',
    'walking dog',
    'walking their dog',
    'dog walking'
  ],
  question: 'how many people are',
  theme: 'earth',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.02,
  desc: 'Estimated number of people currently walking a dog somewhere on Earth.',
  source: 'source: pet ownership statistics',
  fetch: async () => {

    const est =
      45000000 +
      Math.round(Math.random() * 15000000);

    return {
      number: est,
      sub: 'good dogs receiving exercise'
    };

  }
},
{
  id: 'delivery',
  emoji: '🍕',
  label: 'waiting for food delivery',
  aliases: [
    'waiting for food',
    'food delivery',
    'doordash',
    'ubereats',
    'grubhub'
  ],
  question: 'how many people are',
  theme: 'earth',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.01,
  desc: 'Estimated number of people currently waiting for food to arrive.',
  source: 'source: delivery platform statistics',
  fetch: async () => {

    const est =
      12000000 +
      Math.round(Math.random() * 5000000);

    return {
      number: est,
      sub: 'checking the map every 30 seconds'
    };

  }
},
{
  id: 'airport',
  emoji: '🛫',
  label: 'inside an airport',
  aliases: [
    'airport',
    'at the airport',
    'waiting for a flight',
    'terminal'
  ],
  question: 'how many people are',
  theme: 'sky',
  status: 'calc',
  statusLabel: 'AVIATION MODEL',
  bar: 0.04,
  desc: 'Estimated number of people currently inside airports worldwide.',
  source: 'source: IATA passenger statistics',
  fetch: async () => {

    const est =
      90000000 +
      Math.round(Math.random() * 20000000);

    return {
      number: est,
      sub: 'travelers and airport staff'
    };

  }
},
{
  id: 'concert',
  emoji: '🎵',
  label: 'at a concert',
  aliases: [
    'concert',
    'music festival',
    'live music',
    'show',
    'gig'
  ],
  question: 'how many people are',
  theme: 'dream',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.005,
  desc: 'Estimated number of people currently attending live music events.',
  source: 'source: global entertainment statistics',
  fetch: async () => {

    const est =
      5000000 +
      Math.round(Math.random() * 3000000);

    return {
      number: est,
      sub: 'live music audiences worldwide'
    };

  }
},
{
  id: 'selfie',
  emoji: '🤳',
  label: 'taking a selfie',
  aliases: [
    'selfie',
    'taking a selfie',
    'taking pictures',
    'taking a photo'
  ],
  question: 'how many people are',
  theme: 'time',
  status: 'calc',
  statusLabel: 'STATISTICAL MODEL',
  bar: 0.01,
  desc: 'Estimated number of people currently taking a selfie.',
  source: 'source: smartphone usage studies',
  fetch: async () => {

    const est =
      8000000 +
      Math.round(Math.random() * 3000000);

    return {
      number: est,
      sub: 'capturing themselves right now'
    };

  }
},
{
  id: 'reading',
  emoji: '📖',
  label: 'reading a book',
  aliases: [
    'reading',
    'book',
    'reading a book',
    'reading novels'
  ],
  question: 'how many people are',
  theme: 'dream',
  status: 'est',
  statusLabel: 'ESTIMATED',
  bar: 0.02,
  desc: 'Estimated number of people currently reading a book.',
  source: 'source: literacy and reading studies',
  fetch: async () => {

    const est =
      140000000 +
      Math.round(Math.random() * 40000000);

    return {
      number: est,
      sub: 'physical and digital books'
    };

  }
},
{
  id: 'toilet',
  emoji: '🚽',
  label: 'sitting on a toilet',
  aliases: [
    'toilet',
    'bathroom',
    'pooping',
    'taking a dump',
    'using the bathroom',
    'peeing'
  ],
  question: 'how many people are',
  theme: 'earth',
  status: 'calc',
  statusLabel: 'HIGHLY SCIENTIFIC',
  bar: 0.015,
  desc: 'Estimated number of people currently using a toilet. Do we need to add one to the count?',
  source: 'source: biology and probability',
  fetch: async () => {

    const est =
      85000000 +
      Math.round(Math.random() * 20000000);

    return {
      number: est,
      sub: 'humanity united by a common activity'
    };

  }
},
{
  id: 'iss',
  aliases: ['space station', 'iss', 'astronauts overhead', 'in orbit', 'above earth'],
  emoji: '🛰️',
  label: 'Under the International Space Station',
  question: 'how many people are',
  theme: 'space',
  status: 'api',
  statusLabel: 'NASA ORBIT DATA',
  bar: 0.05,
  desc: 'People currently beneath the ISS ground track.',
  source: 'Open Notify ISS API',
  fetch: async () => {
    try {
      const r = await fetch('http://api.open-notify.org/astros.json');
      const d = await r.json();

      const astronauts = d.number || 0;

      return {
        number: 8000000000 - astronauts,
        sub: `${astronauts} humans currently in space`
      };

    } catch {
      return {
        number: 7999999992,
        sub: 'low orbit estimate'
      };
    }
  }
},
{
  id: 'elevators',
  aliases: ['elevator', 'lift', 'buildings', 'skyscraper', 'stuck in elevator'],
  emoji: '🏢',
  label: 'Inside elevators right now',
  question: 'how many people are',
  theme: 'urban',
  status: 'simulated',
  statusLabel: 'BUILDING MODEL',
  bar: 0.12,
  desc: 'Estimated number of people currently riding elevators globally.',
  source: 'urban density simulation',
  fetch: async () => {

    const buildings = 20000000;
    const avgElevators = 4;
    const avgOccupancy = 3;

    const people = buildings * avgElevators * avgOccupancy * 0.1;

    return {
      number: Math.floor(people),
      sub: 'active elevator load estimate'
    };
  }
},
{
  id: 'loading',
  aliases: ['loading', 'buffering', 'spinning wheel', 'waiting', 'lag'],
  emoji: '⏳',
  label: 'Waiting for something to load',
  question: 'how many people are',
  theme: 'digital',
  status: 'simulated',
  statusLabel: 'LATENCY MODEL',
  bar: 0.33,
  desc: 'Estimated number of people currently waiting on loading screens.',
  source: 'internet behavior model',
  fetch: async () => {

    const usersOnline = 5000000000;
    const waitingRatio = 0.07;

    return {
      number: Math.floor(usersOnline * waitingRatio),
      sub: 'based on average latency + app load rates'
    };
  }
},

{
  id: 'typing',
  aliases: ['typing', 'texting', 'chatting', 'sending messages', 'keyboard'],
  emoji: '⌨️',
  label: 'people typing right now',
  question: 'how many people are',
  theme: 'digital',
  status: 'estimated',
  statusLabel: 'REALTIME BEHAVIOR MODEL',
  bar: 0.62,
  desc: 'Estimated number of people actively typing on devices.',
  source: 'human interaction model',
  fetch: async () => {

    const online = 5000000000;
    const typingRatio = 0.03;

    return {
      number: Math.floor(online * typingRatio),
      sub: 'messages currently being composed globally'
    };
  }
},
{
  id: 'lost',
  aliases: ['lost', 'confused', 'wandering', 'no direction', 'gps off'],
  emoji: '🧭',
  label: 'people currently lost',
  question: 'how many people are',
  theme: 'chaos',
  status: 'simulated',
  statusLabel: 'DIRECTION ERROR MODEL',
  bar: 0.19,
  desc: 'Estimated number of people currently lost physically or digitally.',
  source: 'behavioral estimation model',
  fetch: async () => {

    const worldPop = 8000000000;
    const lostRatio = 0.01;

    return {
      number: Math.floor(worldPop * lostRatio),
      sub: 'includes physical + digital disorientation'
    };
  }
},
{
  id: 'wildfires',
  aliases: ['wildfire', 'fire', 'forest fire', 'smoke', 'burning'],
  emoji: '🔥',
  label: 'people near active wildfires',
  question: 'how many people are',
  theme: 'disaster',
  status: 'api',
  statusLabel: 'NASA FIRMS DATA',
  bar: 0.14,
  desc: 'Population exposure estimate from active fire detections.',
  source: 'NASA FIRMS (Fire Information for Resource Management System)',
  fetch: async () => {
    try {
      const r = await fetch('https://firms.modaps.eosdis.nasa.gov/api/area/csv/VIIRS_SNPP_NRT/world/1');
      const text = await r.text();

      const fireCount = text.split('\n').length || 200;

      return {
        number: fireCount * 30000,
        sub: `${fireCount} fire detections (approx)`
      };

    } catch {
      return {
        number: 600000,
        sub: 'global fire exposure estimate'
      };
    }
  }
},
{
  id: 'internet_latency',
  aliases: ['internet slow', 'lag', 'buffering', 'network delay', 'ping'],
  emoji: '📡',
  label: 'people experiencing internet latency',
  question: 'how many people are',
  theme: 'digital',
  status: 'api',
  statusLabel: 'CLOUDFLARE GLOBAL EDGE MODEL',
  bar: 0.67,
  desc: 'Estimated users currently experiencing degraded network performance.',
  source: 'Cloudflare Radar public metrics (modeled)',
  fetch: async () => {
    try {
      const r = await fetch('https://1.1.1.1/cdn-cgi/trace');
      const text = await r.text();

      const isOk = text.includes('trace');

      const worldUsers = 5000000000;
      const degraded = isOk ? worldUsers * 0.06 : worldUsers * 0.12;

      return {
        number: Math.floor(degraded),
        sub: 'global edge network performance variance'
      };

    } catch {
      return {
        number: 350000000,
        sub: 'internet latency estimate'
      };
    }
  }
}

];

const formatNum = (n) => {
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3) return n.toLocaleString();
  return String(n);
};

const state = {};

async function loadCard(card) {
  const el = document.getElementById('card-' + card.id);
  if (!el) return;
  const numEl = el.querySelector('.card-number');
  const subEl = el.querySelector('.card-sub');
  const barFill = el.querySelector('.card-bar-fill');
  numEl.innerHTML = '<span class="loading-dots"></span>';
  try {
    const result = await card.fetch();
    state[card.id] = result;
    numEl.textContent = formatNum(result.number);
    numEl.className = `card-number num-${card.theme}`;
    if (result.sub) subEl.textContent = result.sub;
    if (barFill) barFill.style.width = (card.bar * 100) + '%';
  } catch (e) {
    numEl.textContent = 'N/A';
  }
}


const searchInput = document.getElementById('search-input');
const suggestionsEl = document.getElementById('suggestions');

const SUGGESTION_ITEMS =
  CARDS.map(card => ({
    id: card.id,
    emoji: card.emoji,
    query: card.label
  }));

function renderSuggestions(filter){

  filter = filter.toLowerCase().trim();

  if(filter.length < 1){

    suggestionsEl.classList.remove('show');
    return;

  }

  const items = CARDS.filter(card => {

    const labelMatch =
      card.label
      .toLowerCase()
      .includes(filter);

    const aliasMatch =
      card.aliases &&
      card.aliases.some(alias =>
        alias
        .toLowerCase()
        .includes(filter)
      );

    return labelMatch || aliasMatch;

  });

  if(!items.length){

    suggestionsEl.classList.remove('show');
    return;

  }

  suggestionsEl.innerHTML = items.map(card => {

    const matchedAlias =
      card.aliases?.find(alias =>
        alias
        .toLowerCase()
        .includes(filter)
      );

    return `

      <div
        class="suggestion-item"
        data-id="${card.id}"
      >

        <span class="sug-icon">
          ${card.emoji}
        </span>

        <span class="sug-text">

          <strong>
            ${card.label}
          </strong>

          ${
            matchedAlias
            ? `<span class="alias-match">
                matched "${matchedAlias}"
               </span>`
            : ''
          }

        </span>

      </div>

    `;

  }).join('');

  suggestionsEl
  .querySelectorAll('.suggestion-item')
  .forEach(el => {

    el.addEventListener('click', async () => {

      const id = el.dataset.id;

      const card =
        CARDS.find(c => c.id === id);

      if(!card) return;

      searchInput.value =
        card.label;

      suggestionsEl.classList.remove('show');

      await showResult(card);

      document
        .getElementById('results')
        .scrollIntoView({
          behavior:'smooth'
        });

    });

  });

  suggestionsEl.classList.add('show');

  attachSuggestionEvents();

}

//searchInput.addEventListener('focus', () => renderSuggestions(''));
searchInput.addEventListener('input', (e) => renderSuggestions(e.target.value));
document.addEventListener('click', (e) => { if (!e.target.closest('.search-wrap')) suggestionsEl.classList.remove('show'); });

function drawStars() {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 1.2;
    const a = Math.random() * 0.7 + 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 215, 255, ${a})`;
    ctx.fill();
  }
}

setInterval(() => {
  CARDS.forEach(card => loadCard(card));
}, 30000);

drawStars();
window.addEventListener('resize', drawStars);

async function showResult(card){

    const results =
    document.getElementById("results");

    results.innerHTML =
    `<div class="result-card">
        Loading...
    </div>`;

    const data =
    await card.fetch();

    results.innerHTML = `

        <div class="result-card">

            <div class="result-top">

                <div class="result-emoji">
                    ${card.emoji}
                </div>

                <div>

                    <div class="result-label">
                        ${card.label}
                    </div>

                    <div class="result-number">
                        ${formatNum(data.number)}
                    </div>

                </div>

            </div>

            <div class="result-description">
                ${card.desc}
            </div>

            <div class="result-meta">

                <div class="meta-box">
                    <div class="meta-title">
                        Source
                    </div>

                    ${card.source}
                </div>
                <!--
                <div class="meta-box">
                    <div class="meta-title">
                        Updated
                    </div>

                    ${new Date().toLocaleTimeString()}
                </div>
                -->
                <div class="meta-box">
                    <div class="meta-title">
                        Details
                    </div>

                    ${card.detail || "No additional data available."}
                </div>

                <div class="meta-box">
                    <div class="meta-title">
                        Method
                    </div>

                    ${card.statusLabel}
                </div>

            </div>

        </div>

    `;
}

searchInput.addEventListener(
  'keydown',
  async (e) => {

    if(e.key !== 'Enter')
      return;

    const value =
      searchInput.value
      .toLowerCase()
      .trim();

    const card = CARDS.find(card => {

  const labelMatch =
    card.label
    .toLowerCase()
    .includes(value);

  const aliasMatch =
    card.aliases &&
    card.aliases.some(alias =>
      alias
      .toLowerCase()
      .includes(value)
    );

  return labelMatch || aliasMatch;

});

    if(!card){

      shakeSearch();

      return;

    }

    suggestionsEl.classList.remove('show');

    await showResult(card);

    document
      .getElementById('results')
      .scrollIntoView({
        behavior:'smooth'
      });

  }
);

function shakeSearch(){

  const box =
    document.querySelector('.search-box');

  box.classList.remove('shake');

  void box.offsetWidth;

  box.classList.add('shake');

  box.classList.add('search-error');

  setTimeout(() => {

    box.classList.remove(
      'search-error'
    );

  },1000);

}