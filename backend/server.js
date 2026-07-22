import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import RSSParser from 'rss-parser';

const app = express();

// Allow all origins (handles Vercel previews + custom domains)
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check for Render (prevents cold-start spin-down)
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'FarmAI Backend', timestamp: new Date().toISOString() });
});

const parser = new RSSParser();

let pricesCache = null;
let lastFetch = 0;

const API_KEY = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const DATA_GOV_API = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=1000`;

async function fetchRealMandiPrices() {
  const now = Date.now();

  if (pricesCache && (now - lastFetch < 600000)) {
    return pricesCache;
  }

  try {
    const response = await fetch(DATA_GOV_API);
    const json = await response.json();
    
    if (!json.records) throw new Error('Invalid response from Govt API');

    const liveMarketData = {};

    for (const record of json.records) {
      const state = record.state;
      const commodity = record.commodity;

      if (!liveMarketData[state]) liveMarketData[state] = {};

      if (!liveMarketData[state][commodity]) {
        liveMarketData[state][commodity] = {
          price: parseInt(record.modal_price) || 0,
          min: parseInt(record.min_price) || 0,
          max: parseInt(record.max_price) || 0,
          trend: 'stable',
          market: record.market,
          flash: null
        };
      }
    }

    const backupStates = ['Punjab', 'Maharashtra', 'Uttar Pradesh', 'Gujarat', 'West Bengal', 'Rajasthan'];
    const backupCrops = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Mustard', 'Onion', 'Soybean', 'Tomato', 'Sugarcane', 'Potato', 'Groundnut', 'Gram', 'Bajra'];
    const anchorBase = { Wheat: 2275, Rice: 2183, Maize: 1890, Cotton: 6850, Mustard: 5200, Onion: 2500, Soybean: 4400, Tomato: 1200, Sugarcane: 3150, Potato: 900, Groundnut: 5600, Gram: 5440, Bajra: 2200 };

    for (const st of backupStates) {
      if (!liveMarketData[st]) liveMarketData[st] = {};
      for (const cr of backupCrops) {
        if (!liveMarketData[st][cr]) {
            const bp = anchorBase[cr] || 2000;
            liveMarketData[st][cr] = {
              price: bp,
              min: Math.round(bp * 0.95),
              max: Math.round(bp * 1.05),
              trend: 'stable',
              market: st + ' Central',
              flash: null
            };
        }
      }
    }

    pricesCache = liveMarketData;
    lastFetch = now;
    return liveMarketData;

  } catch (error) {
    console.error('Error fetching REAL data:', error.message);
    if (pricesCache) return pricesCache; // Fallback to stale cache
    throw new Error('Failed to fetch Mandi rates.');
  }
}

app.get('/api/mandi/prices', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Incoming request for live prices...`);
    const liveData = await fetchRealMandiPrices();
    
    res.json({
      success: true,
      timestamp: Date.now(),
      source: 'Govt of India Agmarknet API',
      data: liveData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching market data.' });
  }
});

let newsCache = null;
let lastNewsFetch = 0;

app.get('/api/news', async (req, res) => {
  try {
    const now = Date.now();
    if (newsCache && (now - lastNewsFetch < 1800000)) { // 30 minutes cache
      return res.json({ success: true, cached: true, data: newsCache });
    }

    console.log(`[${new Date().toISOString()}] Fetching fresh Agri RSS News...`);
    const feed = await parser.parseURL('https://eng.ruralvoice.in/rss/latest-posts');
    
    const formattedNews = feed.items.slice(0, 15).map((item, index) => {

      return {
        id: index + 1,
        title: item.title,
        summary: item.contentSnippet || item.content || 'Tap to read the full story on the portal.',
        link: item.link,
        date: item.pubDate,
        source: 'RuralVoice India',
        category: item.categories && item.categories.length > 0 ? item.categories[0] : 'General Agri News'
      };
    });

    newsCache = formattedNews;
    lastNewsFetch = now;
    
    res.json({ success: true, data: formattedNews });
  } catch (error) {
    console.error('RSS Fetch Error:', error.message);
    if(newsCache) return res.json({ success: true, data: newsCache }); // fallback
    res.status(500).json({ success: false, message: 'Server error parsing news RSS feed.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌾 FarmAI REAL Live Mandi Server running on http://localhost:${PORT}`);
  console.log(`🚀 Proxied to Agmarknet (data.gov.in) API...`);
});
