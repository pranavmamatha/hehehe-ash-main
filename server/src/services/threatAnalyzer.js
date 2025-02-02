const Product = require('../models/Product');
const News = require('../models/News');
const { analyzeThreatLevel } = require('./openai');

const analyzeNewThreats = async () => {
  try {
    // Get latest news
    const latestNews = await News.find({
      lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (!latestNews.length) return;

    // Get all products
    const products = await Product.find({});

    for (const product of products) {
      for (const news of latestNews) {
        // Check if tags match
        const hasMatchingTags = news.tags.some(tag => product.tags.includes(tag));
        
        if (hasMatchingTags) {
          // Analyze threat level
          const { severity, status } = await analyzeThreatLevel(product, news);

          // Add threat to product if significant
          if (status !== 'safe') {
            product.threats.push({
              newsId: news._id,
              status,
              severity
            });
          }
        }
      }
      await product.save();
    }

    console.log(`[${new Date().toISOString()}] Threat analysis completed`);
  } catch (error) {
    console.error('Error analyzing threats:', error);
  }
};

// Run analysis every 5 minutes
setInterval(analyzeNewThreats, 5 * 60 * 1000);

module.exports = { analyzeNewThreats }; 