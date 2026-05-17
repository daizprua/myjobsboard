const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Automates a simple job application form
 */
async function autoFillApplication(applyUrl, profile, coverLetterText) {
  let browser;
  try {
    console.log(`Starting Puppeteer for ${applyUrl}`);
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Attempt to navigate to the apply URL
    await page.goto(applyUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Very basic heuristic autofill logic (this needs fine-tuning per job board)
    // Here we just attempt to find common input fields by name or id and fill them
    try {
      const nameInput = await page.$('input[name*="name" i], input[id*="name" i]');
      if (nameInput) await nameInput.type(profile.fullName);

      const emailInput = await page.$('input[name*="email" i], input[type="email"]');
      if (emailInput) await emailInput.type(profile.email);

      const linkedinInput = await page.$('input[name*="linkedin" i]');
      if (linkedinInput && profile.linkedin) await linkedinInput.type(profile.linkedin);

      const githubInput = await page.$('input[name*="github" i]');
      if (githubInput && profile.github) await githubInput.type(profile.github);

      // We'll leave the actual submit button un-clicked by default for safety
      // Instead we take a screenshot to show the user the filled form
    } catch (fillError) {
      console.warn("Could not autofill some fields.", fillError.message);
    }

    // Take screenshot of the result
    const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const screenshotName = `app_${Date.now()}.png`;
    const screenshotPath = path.join(screenshotsDir, screenshotName);
    
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    await browser.close();
    
    return { success: true, screenshot: screenshotName };
    
  } catch (error) {
    console.error('Puppeteer Error:', error);
    if (browser) await browser.close();
    return { success: false, error: error.message };
  }
}

module.exports = {
  autoFillApplication
};
