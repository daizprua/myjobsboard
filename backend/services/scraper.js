const Parser = require('rss-parser');
const axios = require('axios');
const prisma = require('../prisma');
const parser = new Parser();

// WeWorkRemotely RSS feed for programming jobs
const WWR_FEED_URL = 'https://weworkremotely.com/categories/remote-programming-jobs.rss';
// RemoteOK API
const REMOTEOK_API_URL = 'https://remoteok.com/api';

async function fetchWeWorkRemotely() {
  try {
    const feed = await parser.parseURL(WWR_FEED_URL);
    const jobs = feed.items.map(item => ({
      title: item.title || 'Unknown Title',
      company: item.creator || 'Unknown Company',
      location: 'Remote',
      tags: item.categories ? item.categories.join(', ') : '',
      description: item.contentSnippet || item.content || '',
      applyUrl: item.link,
      source: 'WeWorkRemotely',
      externalId: `wwr-${item.guid || item.link}`,
      datePosted: new Date(item.pubDate || new Date())
    }));
    return jobs;
  } catch (error) {
    console.error('Error fetching WeWorkRemotely:', error);
    return [];
  }
}

async function fetchRemoteOK() {
  try {
    // Adding a user agent helps prevent simple blocks
    const response = await axios.get(REMETOK_API_URL, {
      headers: { 'User-Agent': 'MyJobsBoard-Automated-Scraper' }
    });
    // First item is legal info, jobs start from index 1
    const data = response.data.slice(1);
    const jobs = data.map(item => ({
      title: item.position || 'Unknown Title',
      company: item.company || 'Unknown Company',
      logoUrl: item.company_logo || null,
      location: item.location || 'Remote',
      tags: item.tags ? item.tags.join(', ') : '',
      description: item.description || '',
      applyUrl: item.apply_url || item.url,
      source: 'RemoteOK',
      externalId: `rok-${item.id}`,
      datePosted: new Date(item.date || new Date())
    }));
    return jobs;
  } catch (error) {
    console.error('Error fetching RemoteOK:', error);
    return [];
  }
}

async function runScraper() {
  console.log('🔄 Starting Job Scraper...');
  const [wwrJobs, rokJobs] = await Promise.all([
    fetchWeWorkRemotely(),
    fetchRemoteOK()
  ]);

  const allJobs = [...wwrJobs, ...rokJobs];
  let newJobsCount = 0;

  for (const job of allJobs) {
    // Check if job exists
    const existing = await prisma.job.findUnique({
      where: { externalId: job.externalId }
    });

    if (!existing) {
      await prisma.job.create({ data: job });
      newJobsCount++;
    }
  }

  console.log(`✅ Scraper finished. Added ${newJobsCount} new jobs.`);
}

module.exports = { runScraper };
