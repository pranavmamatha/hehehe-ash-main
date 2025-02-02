const axios = require('axios');
const News = require('../models/News');

const OTX_API_KEY = '044a3d5582a49575ee6f1d37560ccc87318f232239bc7b1f915feb9315045862';
const OTX_API_URL = 'https://otx.alienvault.com/api/v1';

const fetchPulseDetails = async (pulseId) => {
  try {
    const response = await axios.get(`${OTX_API_URL}/pulses/${pulseId}`, {
      headers: {
        'X-OTX-API-KEY': OTX_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching pulse details for ${pulseId}:`, error);
    return null;
  }
};

const updateNewsCache = async () => {
  try {
    const allPulses = [];
    const limit = 50;
    const pages = 3;

    const fetchPromises = Array.from({ length: pages }, (_, i) => {
      return axios.get(`${OTX_API_URL}/pulses/subscribed`, {
        headers: {
          'X-OTX-API-KEY': OTX_API_KEY
        },
        params: {
          limit: limit,
          page: i + 1,
          modified_since: '2020-01-01'
        }
      });
    });

    const responses = await Promise.all(fetchPromises);

    responses.forEach(response => {
      const pulses = response.data.results.map(pulse => ({
        id: pulse.id,
        title: pulse.name,
        description: pulse.description,
        created: new Date(pulse.created),
        tags: pulse.tags || []
      }));
      allPulses.push(...pulses);
    });

    // Sort by creation date (newest first)
    allPulses.sort((a, b) => b.created - a.created);

    // Update cache in database
    await News.deleteMany({});
    await News.insertMany(allPulses);

    console.log(`[${new Date().toISOString()}] Cache updated: Fetched ${allPulses.length} threats`);
    return allPulses;
  } catch (error) {
    console.error('Error updating news cache:', error);
    throw error;
  }
};

const fetchPulses = async () => {
  try {
    let threats = await News.find({})
      .sort({ created: -1 })
      .lean();
    
    if (!threats.length) {
      console.log('Cache empty, fetching from API...');
      threats = await updateNewsCache();
    }

    return threats;
  } catch (error) {
    console.error('Error fetching pulses:', error);
    throw error;
  }
};

// Set up periodic cache update (every 5 minutes)
setInterval(async () => {
  try {
    await updateNewsCache();
  } catch (error) {
    console.error('Error in periodic cache update:', error);
  }
}, 5 * 60 * 1000);

// Initial cache update when server starts
updateNewsCache().catch(error => {
  console.error('Error in initial cache update:', error);
});

module.exports = { fetchPulses }; 