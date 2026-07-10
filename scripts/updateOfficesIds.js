import fs from 'fs';

const API_KEY = "bFPEKJtcAcXiFLl1nCjMwf1q8IlV2uhekDkEsTHIIvc3Bdcs70RzYcpl3AnfG3gC";
const TENANT_ID = "05265916-7865-42b3-9b0d-c39778155479";
const API_BASE = "https://api.zrexpress.app";

async function fetchAllHubs() {
  const res = await fetch(`${API_BASE}/api/v1/hubs/search`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-Api-Key': API_KEY,
      'X-Tenant': TENANT_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pageSize: 500 })
  });

  if (!res.ok) {
    console.error("Failed to fetch hubs", await res.text());
    return;
  }

  const data = await res.json();
  const hubs = data.items;

  const officesPath = 'src/lib/zr_offices.json';
  const offices = JSON.parse(fs.readFileSync(officesPath, 'utf8'));

  let matched = 0;
  let unmatched = 0;

  for (let office of offices) {
    // try to match by name or commune
    // ZR hub names look like "Hub Adrar 01 مكتب أدرار"
    // Our office names look like "Hub Adrar 01"
    const match = hubs.find(h => {
        const cleanHubName = h.name.toLowerCase().split('مكتب')[0].trim();
        return cleanHubName === office.name.toLowerCase() || h.name.toLowerCase().includes(office.name.toLowerCase());
    });

    if (match) {
      office.id = match.id;
      matched++;
    } else {
      unmatched++;
      console.log("No match for:", office.name);
    }
  }

  fs.writeFileSync(officesPath, JSON.stringify(offices, null, 2));
  console.log(`Updated zr_offices.json! Matched: ${matched}, Unmatched: ${unmatched}`);
}
fetchAllHubs();
