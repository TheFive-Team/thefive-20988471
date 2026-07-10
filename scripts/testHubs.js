const API_KEY = "bFPEKJtcAcXiFLl1nCjMwf1q8IlV2uhekDkEsTHIIvc3Bdcs70RzYcpl3AnfG3gC";
const TENANT_ID = "05265916-7865-42b3-9b0d-c39778155479";
const API_BASE = "https://api.zrexpress.app";

async function testH() {
  const res = await fetch(`${API_BASE}/api/v1/hubs/search`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-Api-Key': API_KEY,
      'X-Tenant': TENANT_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  console.log("hubs POST:", res.status);
  if (res.ok) {
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2).substring(0, 2000));
  } else {
    console.log(await res.text());
  }
}
testH();
