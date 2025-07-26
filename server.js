const express = require('express');
const { createServer } = require('http');
const { Server: SocketIO } = require('socket.io');
const { EventSource } = require('eventsource');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new SocketIO(server);

const PORT = 3000;
const sseUrl = 'http://api.deadlock-api.com/v1/matches/38202236/live/demo/events';
let heroMap = {};
let cachedData = {
  assists: {},
  deaths: {},
  kills: {},
  hero_damage: {},
  hero_healing: {},
  last_hits: {},
  net_worth: {},
  objective_damage: {}
};

app.use(express.static('public'));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function fetchHeroMap() {
  try {
    const res = await fetch('https://assets.deadlock-api.com/v2/heroes');
    const heroes = await res.json();
    heroes.forEach(hero => {
      heroMap[hero.id] = hero.name;
    });
    console.log('Fetched hero list');
  } catch (err) {
    console.error('Failed to fetch hero data:', err);
  }
}

fetchHeroMap();

const es = new EventSource(sseUrl, {
  headers: {
    'Accept': '*/*',
    'X-API-Key': process.env.API_KEY
  }
});

es.onopen = () => {
  console.log('Connected to SSE stream');
};

es.addEventListener('player_controller_entity_update', (msg) => {
  try {
    const data = JSON.parse(msg.data);

    if (data.team !== 2 && data.team !== 3) return;

    const heroName = heroMap[data.hero_id] || `Hero ${data.hero_id}`;
    const steamName = data.steam_name;
    const time = Math.floor(data.game_time);

    const playerKey = `${steamName} (${heroName}) [Team ${data.team}]`;

    const stats = {
      assists: data.assists,
      deaths: data.deaths,
      kills: data.kills,
      hero_damage: data.hero_damage,
      hero_healing: data.hero_healing,
      last_hits: data.last_hits,
      net_worth: data.net_worth,
      objective_damage: data.objective_damage
    };

    // Cache
    Object.entries(stats).forEach(([stat, value]) => {
      if (!cachedData[stat][playerKey]) {
        cachedData[stat][playerKey] = [];
      }
      cachedData[stat][playerKey].push({ x: time, y: value });
    });

    const playerStats = {
      steam_name: steamName,
      hero_id: data.hero_id,
      hero_name: heroName,
      team: data.team,
      game_time: time,
      ...stats
    };

    io.emit('player_update', playerStats);

  } catch (err) {
    console.error('Failed to parse player update:', err);
  }
});

// match ended (?)
es.addEventListener('end', () => {
  console.log('SSE stream ended by server. Closing connection to avoid extra usage. My precious.');
  io.emit('stream_end');
  es.close();
});

// Allow requesting of cached stats
app.get('/cached-data', (req, res) => {
  res.json(cachedData);
});
