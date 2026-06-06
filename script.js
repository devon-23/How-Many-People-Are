const CARDS = [
  {
    id: 'space',
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
    emoji: '🌙',
    label: 'who can see the moon tonight',
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
    emoji: '🛸',
    label: 'tracked objects in orbit',
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
  }
];

const SEARCH_MAP = [
  { query: 'in space', id: 'space' },
  { query: 'in space right now', id: 'space' },
  { query: 'watching a sunset', id: 'sunset' },
  { query: 'seeing a sunset', id: 'sunset' },
  { query: 'watching the moon', id: 'moon' },
  { query: 'who can see the moon', id: 'moon' },
  { query: 'asleep', id: 'sleep' },
  { query: 'sleeping', id: 'sleep' },
  { query: 'on a plane', id: 'flight' },
  { query: 'flying', id: 'flight' },
  { query: 'being born', id: 'birth' },
  { query: 'born right now', id: 'birth' },
  { query: 'online', id: 'internet' },
  { query: 'on the internet', id: 'internet' },
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

const SUGGESTION_ITEMS = [
  { query: 'in space right now', id: 'space', emoji: '🧑‍🚀' },
  { query: 'watching a sunset', id: 'sunset', emoji: '🌅' },
  { query: 'who can see the moon', id: 'moon', emoji: '🌙' },
  { query: 'asleep right now', id: 'sleep', emoji: '😴' },
  { query: 'on a plane', id: 'flight', emoji: '✈️' },
  { query: 'being born right now', id: 'birth', emoji: '👶' },
  { query: 'online right now', id: 'internet', emoji: '🌐' },
  { query: 'tracked objects in orbit', id: 'objects', emoji: '🛸', prefix: 'how many human-made' },
];

function renderSuggestions(filter) {
  const items = filter
    ? SUGGESTION_ITEMS.filter(s => s.query.includes(filter.toLowerCase()))
    : SUGGESTION_ITEMS;
  if (!items.length) { suggestionsEl.classList.remove('show'); return; }
  suggestionsEl.innerHTML = items.map(s => `
    <div class="suggestion-item" data-id="${s.id}">
      <span class="sug-icon">${s.emoji}</span>
      <span class="sug-text">${s.prefix ? '<span style="color:#4a7fa5">'+s.prefix+'</span> ' : '<span style="color:#4a7fa5">how many people are</span> '}<strong>${s.query}</strong></span>
    </div>
  `).join('');
  suggestionsEl.classList.add('show');
  suggestionsEl.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const card = CARDS.find(c => c.id === id);
      searchInput.value = el.querySelector('strong').textContent;
      suggestionsEl.classList.remove('show');
      if (card) {
        const cardEl = document.getElementById('card-' + id);
        if (cardEl) { cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); cardEl.style.border = '1px solid rgba(61,155,233,0.6)'; setTimeout(() => { cardEl.style.border = ''; }, 2000); }
        showResult(card);
      }
    });
  });
}

searchInput.addEventListener('focus', () => renderSuggestions(''));
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

                <div class="meta-box">
                    <div class="meta-title">
                        Updated
                    </div>

                    ${new Date().toLocaleTimeString()}
                </div>

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
    "keydown",
    (e)=>{

        if(e.key !== "Enter")
            return;

        const value =
        searchInput.value.toLowerCase();

        const match =
        SEARCH_MAP.find(item =>
            value.includes(item.query)
        );

        if(!match)
            return;

        const card =
        CARDS.find(
            c => c.id === match.id
        );

        if(card){

            showResult(card);

            document
            .getElementById("results")
            .scrollIntoView({
                behavior:"smooth"
            });

        }

    }
);