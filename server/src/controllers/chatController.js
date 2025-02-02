const { fetchPulses } = require('../services/alienVault');
const { generateChatResponse } = require('../services/openai');
const Chat = require('../models/Chat');
const News = require('../models/News');

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get or create chat history
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    // Get cached news or fetch new ones
    let threats = await News.find({
      lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Within last 5 minutes
    });

    if (!threats.length) {
      threats = await fetchPulses();
      // Cache the new threats
      await News.deleteMany({}); // Clear old cache
      await News.insertMany(threats.map(t => ({
        ...t,
        lastUpdated: new Date()
      })));
    }

    // Add user message to history
    chat.messages.push({
      role: 'user',
      content: message
    });

    // Generate AI response
    const response = await generateChatResponse(
      message,
      threats,
      chat.messages.slice(-10) // Send last 10 messages for context
    );

    // Add AI response to history
    chat.messages.push({
      role: 'assistant',
      content: response
    });

    // Save chat history
    await chat.save();

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('Error in chat handler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      message: error.message
    });
  }
};

module.exports = { handleChat }; 