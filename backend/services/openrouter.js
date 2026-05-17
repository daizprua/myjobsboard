const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = 'openai/gpt-4o-mini'; // Fast, cheap model, can be overridden

const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'http://localhost:4000', // Update for production
    'X-Title': 'MyJobsBoard',
  }
});

/**
 * Calculates a match score (0-100) and gives a brief reasoning
 */
async function calculateMatchScore(jobDescription, profileSkills) {
  if (!OPENROUTER_API_KEY) return { score: 0, reason: "No API Key" };
  
  const prompt = `
    You are an expert tech recruiter. Analyze the following job description and compare it to the candidate's skills.
    Job Description: ${jobDescription.substring(0, 2000)}
    Candidate Skills: ${profileSkills}
    
    Respond STRICTLY in JSON format:
    { "score": <number 0-100>, "reason": "<brief 1 sentence reason>" }
  `;

  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: DEFAULT_MODEL,
      response_format: { type: "json_object" },
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error in calculateMatchScore:', error.response?.data || error.message);
    return { score: null, reason: "AI Analysis failed" };
  }
}

/**
 * Generates a tailored cover letter
 */
async function generateCoverLetter(jobDetails, profile) {
  if (!OPENROUTER_API_KEY) return "Please configure OpenRouter API Key.";
  
  const prompt = `
    Write a highly professional, engaging cover letter for a software development role.
    Role: ${jobDetails.title} at ${jobDetails.company}
    Job Context: ${jobDetails.description.substring(0, 1500)}
    Candidate: ${profile.fullName}
    Candidate Skills: ${profile.skills}
    Candidate Experience: ${profile.experience}
    
    Keep it concise, modern, and high-impact. Do not use generic buzzwords.
  `;

  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating cover letter:', error.response?.data || error.message);
    return "Failed to generate cover letter.";
  }
}

/**
 * Generates LinkedIn optimization suggestions
 */
async function optimizeLinkedIn(profile) {
  if (!OPENROUTER_API_KEY) return null;
  
  const prompt = `
    You are an expert LinkedIn profile optimizer for Fullstack Developers.
    Based on this profile:
    Skills: ${profile.skills}
    Experience: ${profile.experience}
    Bio: ${profile.bio}
    
    Provide recommendations in JSON format:
    {
      "headline": "A high-impact, SEO-optimized headline",
      "summary": "An engaging, 3-sentence 'About' summary",
      "experienceBullets": ["Bullet 1", "Bullet 2", "Bullet 3"]
    }
  `;

  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: DEFAULT_MODEL,
      response_format: { type: "json_object" },
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error optimizing LinkedIn:', error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  calculateMatchScore,
  generateCoverLetter,
  optimizeLinkedIn
};
