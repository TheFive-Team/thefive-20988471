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

  const data = await res.json();
  const names = data.items.map(h => ({id: h.id, name: h.name}));
  fs.writeFileSync('scripts/all_hubs.json', JSON.stringify(names, null, 2));
}
fetchAllHubs();
