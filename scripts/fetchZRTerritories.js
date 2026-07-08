import fs from 'fs';

const SECRET_KEY = process.env.ZR_EXPRESS_SECRET_KEY;
const TENANT_ID = process.env.ZR_EXPRESS_TENANT_ID;

async function fetchTerritories() {
  console.log("Fetching territories from ZR Express...");
  const response = await fetch('https://api.zrexpress.app/api/v1/territories/search', {
    headers: {
      'X-Api-Key': SECRET_KEY,
      'X-Tenant': TENANT_ID,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error("Failed to fetch:", response.status, await response.text());
    return;
  }

  const data = await response.json();
  fs.writeFileSync('src/lib/zr_territories.json', JSON.stringify(data, null, 2));
  console.log("Territories saved to src/lib/zr_territories.json");
}

fetchTerritories();
