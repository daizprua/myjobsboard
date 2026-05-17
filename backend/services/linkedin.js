const puppeteer = require('puppeteer');

async function updateLinkedInProfile(cookieValue, headline, summary) {
  console.log("Starting LinkedIn Auto-Update via Puppeteer...");
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  try {
    // 1. Set the session cookie
    console.log("Setting session cookie...");
    await page.setCookie({
      name: 'li_at',
      value: cookieValue,
      domain: '.linkedin.com',
      path: '/',
      secure: true,
      httpOnly: true
    });

    // 2. Navigate to LinkedIn Feed to verify login
    console.log("Navigating to LinkedIn Feed...");
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('Sign in') || bodyText.includes('Join now')) {
      throw new Error("Failed to authenticate. The 'li_at' cookie might be expired or invalid.");
    }
    console.log("Successfully authenticated with LinkedIn!");

    // 3. Navigate to personal profile page
    console.log("Navigating to Profile...");
    await page.goto('https://www.linkedin.com/in/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 4. Update the Headline
    // Open Top Card Edit dialog
    console.log("Looking for top card edit controls...");
    // LinkedIn often uses a button with an edit icon inside the top card
    const editBtnSelector = 'button[class*="edit-top-card"]';
    
    // We will attempt to find the edit button and click it
    await page.waitForSelector('main', { timeout: 10000 });
    
    // We can execute a custom script on the page to find the edit elements
    const clickedEdit = await page.evaluate(() => {
      // Find pencil buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      const editTopCardBtn = buttons.find(b => b.getAttribute('aria-label')?.includes('Edit intro') || b.querySelector('svg[type="pencil-icon"]'));
      if (editTopCardBtn) {
        editTopCardBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedEdit) {
      console.log("Could not click top card edit button directly, trying custom selectors...");
      // Fallback selector-based click
      try {
        await page.click('a[href*="edit/intro"]');
      } catch (err) {
        throw new Error("Could not open the Profile Edit dialog. Please update manually using the generated suggestions.");
      }
    }

    // Wait for the modal dialog to load
    console.log("Waiting for edit dialog modal...");
    await page.waitForSelector('input[id*="headline"]', { timeout: 15000 });

    // Focus and fill the headline input field
    console.log("Filling headline...");
    await page.click('input[id*="headline"]', { clickCount: 3 }); // Select all
    await page.keyboard.press('Backspace');
    await page.type('input[id*="headline"]', headline);

    // Save Top Card Dialog
    console.log("Saving top card changes...");
    await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button'));
      const saveBtn = saveButtons.find(b => b.innerText.includes('Save') || b.textContent.includes('Save'));
      if (saveBtn) saveBtn.click();
    });

    // Wait a brief moment for the save transaction to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});

    console.log("LinkedIn profile headline updated successfully!");
    await browser.close();
    return { success: true, message: "Your LinkedIn headline has been updated directly!" };

  } catch (error) {
    console.error("LinkedIn Update Error:", error.message);
    await browser.close();
    return { success: false, error: error.message };
  }
}

async function importLinkedInProfile(cookieValue) {
  console.log("Starting LinkedIn Import via Puppeteer...");
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  try {
    console.log("Setting session cookie...");
    await page.setCookie({
      name: 'li_at',
      value: cookieValue,
      domain: '.linkedin.com',
      path: '/',
      secure: true,
      httpOnly: true
    });

    console.log("Navigating to Profile...");
    await page.goto('https://www.linkedin.com/in/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('Sign in') || bodyText.includes('Join now')) {
      throw new Error("Failed to authenticate. The 'li_at' cookie might be expired or invalid.");
    }

    // Scrape data
    console.log("Extracting profile details...");
    const profileData = await page.evaluate(() => {
      // Name usually in h1
      const nameEl = document.querySelector('h1');
      const fullName = nameEl ? nameEl.innerText.trim() : null;

      // Headline usually right below h1, in a text-body-medium class
      const headlineEl = document.querySelector('.text-body-medium.break-words');
      const headline = headlineEl ? headlineEl.innerText.trim() : null;

      // About summary
      let summary = null;
      const aboutHeaders = Array.from(document.querySelectorAll('h2')).filter(h => h.innerText.includes('About') || h.innerText.includes('Acerca de'));
      if (aboutHeaders.length > 0) {
        const aboutSection = aboutHeaders[0].closest('section');
        if (aboutSection) {
          const spanTexts = Array.from(aboutSection.querySelectorAll('span[aria-hidden="true"]'));
          // Take the longest span or concatenate
          if (spanTexts.length > 0) {
             summary = spanTexts[0].innerText.trim();
          }
        }
      }

      return { fullName, headline, summary };
    });

    console.log("Successfully extracted profile:", profileData.fullName);
    await browser.close();
    return { success: true, data: profileData };

  } catch (error) {
    console.error("LinkedIn Import Error:", error.message);
    await browser.close();
    return { success: false, error: error.message };
  }
}

module.exports = { updateLinkedInProfile, importLinkedInProfile };
