const axios = require('axios');

// LinkedIn Voyager API — internal REST API used by the LinkedIn web app.
// Works with the li_at session cookie, no Puppeteer/browser required.
// This completely avoids the ERR_TOO_MANY_REDIRECTS that headless browsers trigger.

const LI_HEADERS = (cookieValue) => ({
  'Cookie': `li_at=${cookieValue}`,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/vnd.linkedin.normalized+json+2.1',
  'Accept-Language': 'en-US,en;q=0.9',
  'x-li-lang': 'en_US',
  'x-li-track': '{"clientVersion":"1.13.9823","mpVersion":"1.13.9823","osName":"web","timezoneOffset":-5,"timezone":"America/Panama","deviceFormFactor":"DESKTOP","mpName":"voyager-web"}',
  'csrf-token': 'ajax:0',
  'x-restli-protocol-version': '2.0.0',
  'Referer': 'https://www.linkedin.com/',
});

async function importLinkedInProfile(cookieValue) {
  console.log("Starting LinkedIn Import via Voyager API...");

  try {
    // Step 1: Get own profile identity (me endpoint)
    console.log("Calling /voyager/api/me ...");
    const meRes = await axios.get('https://www.linkedin.com/voyager/api/me', {
      headers: LI_HEADERS(cookieValue),
      timeout: 15000,
    });

    const miniProfile = meRes.data?.included?.[0] || meRes.data;
    const fullName = [
      miniProfile?.firstName,
      miniProfile?.lastName,
    ].filter(Boolean).join(' ') || null;
    const headline = miniProfile?.occupation || null;
    const publicId = miniProfile?.publicIdentifier || null;

    console.log("Got me data:", fullName, publicId);

    // Step 2: Get full profile (About/summary)
    let summary = null;
    if (publicId) {
      try {
        console.log("Calling /voyager/api/identity/profiles/" + publicId + " ...");
        const profileRes = await axios.get(
          `https://www.linkedin.com/voyager/api/identity/profiles/${publicId}/profileView`,
          {
            headers: LI_HEADERS(cookieValue),
            timeout: 15000,
          }
        );
        const profile = profileRes.data?.data || {};
        const included = profileRes.data?.included || [];
        // summary is usually in the profile entity
        const profileEntity = included.find(i => i.$type === 'com.linkedin.voyager.identity.profile.Profile');
        if (profileEntity?.summary) {
          summary = profileEntity.summary;
        }
      } catch (profileErr) {
        console.warn("Could not fetch full profile summary:", profileErr.message);
      }
    }

    if (!fullName) {
      throw new Error("Could not extract profile data. Please ensure your 'li_at' cookie is valid and not expired.");
    }

    console.log("Successfully extracted via Voyager API:", fullName);
    return { success: true, data: { fullName, headline, summary } };

  } catch (error) {
    console.error("LinkedIn Voyager Import Error:", error.response?.status, error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return { success: false, error: "La cookie 'li_at' expiró o es inválida. Por favor cópiala nuevamente desde tu navegador en linkedin.com." };
    }
    return { success: false, error: `Error al importar perfil: ${error.message}` };
  }
}

// updateLinkedInProfile still uses puppeteer for the write operation (editing LinkedIn)
// but for now we return a graceful message since write ops require a different flow.
async function updateLinkedInProfile(cookieValue, headline, summary) {
  console.log("LinkedIn profile update requested (headline, summary).");
  // For write operations we'll return suggestions since direct API writes
  // require OAuth 2.0 tokens, not just li_at cookies.
  return {
    success: true,
    message: "Optimización generada. Las sugerencias están listas para copiar a tu perfil de LinkedIn.",
  };
}

module.exports = { updateLinkedInProfile, importLinkedInProfile };
