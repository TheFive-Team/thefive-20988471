const TENANT_ID = "05265916-7865-42b3-9b0d-c39778155479";
const API_KEY = "ihFCvD34a6AIgaa5wEk37NXQG9PqbnQ8ruCAAddavFMGHGXY50f7qGIAcR0OQRBA";

async function testSearch(query) {
  const headers = { 'X-Api-Key': API_KEY, 'X-Tenant': TENANT_ID, 'Content-Type': 'application/json' };
  const res = await fetch(`https://api.zrexpress.app/api/v1/territories/search`, { 
    method: 'POST', headers, body: JSON.stringify({ keyword: query })
  });
  const data = await res.json();
  console.log(`Payload: ${query} -> Total: ${data.totalCount}`);
  data.items.forEach(item => {
    console.log(` - ${item.nameArabic} (${item.name}) | Level: ${item.level} | ID: ${item.id}`);
  });
}

testSearch("تيارت");
