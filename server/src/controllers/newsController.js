const News = require('../models/News');
const { fetchPulses } = require('../services/alienVault');

const getNews = async (req, res) => {
  try {
    const pulses = await fetchPulses();
    const userTags = req.user.tags;

    // Sort pulses by relevance and date
    const sortedPulses = pulses.sort((a, b) => {
      // Calculate relevance score based on matching tags
      const scoreA = a.tags.filter(tag => userTags.includes(tag)).length;
      const scoreB = b.tags.filter(tag => userTags.includes(tag)).length;
      
      if (scoreA !== scoreB) return scoreB - scoreA; // Sort by relevance first
      return new Date(b.created) - new Date(a.created); // Then by date
    });

    res.json({
      success: true,
      data: sortedPulses
    });
  } catch (error) {
    console.error('Error in getNews controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      message: error.message
    });
  }
};

const getNewById = async (req, res) => {
  try {
    console.log("hi there", req.params.id);
    
    const pulse = await News.findById(req.params.id);
    
    if (!pulse) {
      return res.status(404).json({
        success: false,
        error: 'Pulse not found',
        message: 'Pulse with the given ID was not found'
      });
    }

    res.json({
      success: true,
      data: pulse
    });
  } catch (error) {
    console.error('Error in getNewById controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      message: error.message
    });
  }
} 

module.exports = { getNews, getNewById }; 