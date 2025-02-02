const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateChatResponse = async (userMessage, threatData, chatHistory = []) => {
  try {
    // Format threats with limited description length
    const formattedThreats = threatData
      .slice(0, 30) // Limit to 30 most recent threats
      .map(threat => ({
        title: threat.title,
        description: threat.description.substring(0, 250), // Limit description to 250 chars
        created: new Date(threat.created).toLocaleDateString(),
        tags: threat.tags.slice(0, 3) // Limit to 3 most relevant tags
      }));

    const systemPrompt = `You are a cybersecurity expert. Be concise and direct. Only elaborate when asked.

${formattedThreats.map(threat => 
  `[${threat.created}] ${threat.title}
${threat.tags.join(', ')}
${threat.description}
---`).join('\n')}

Instructions:
1. Give brief, direct answers
2. Only expand when user asks for details
3. Focus on key points
4. Stay on topic;
5. Only discuss cybersecurity and these threats
6. Decline non-security questions`;

    const messages = [
      { 
        role: "system", 
        content: systemPrompt 
      },
      ...chatHistory,
      { 
        role: "user", 
        content: userMessage 
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};

const generateCleanDescription = async (description) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Clean and format the product description professionally. Keep technical details but improve clarity."
        },
        {
          role: "user",
          content: description
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating clean description:', error);
    throw error;
  }
};

const analyzeThreatLevel = async (product, news) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Analyze the security threat level for this product:
Product: ${product.cleanDescription}
Technologies: ${product.technologies.join(', ')}
Tags: ${product.tags.join(', ')}

News Threat: ${news.description}
News Tags: ${news.tags.join(', ')}

Rate severity from 0-100 and classify as:
- safe (0-30)
- warning (31-70)
- danger (71-100)

Return JSON only: { "severity": number, "status": "safe|warning|danger" }`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing threat level:', error);
    throw error;
  }
};

const generateProductChatResponse = async (message, product, relevantThreats) => {
  // Similar to existing generateChatResponse but focused on product context
  // ... implementation
};

module.exports = {
  generateChatResponse,
  generateCleanDescription,
  analyzeThreatLevel,
  generateProductChatResponse
}; 