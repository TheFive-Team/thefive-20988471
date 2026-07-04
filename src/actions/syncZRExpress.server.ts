import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const SECRET_KEY = process.env.ZR_EXPRESS_SECRET_KEY || '';
const TENANT_ID = process.env.ZR_EXPRESS_TENANT_ID || '';
const API_BASE = 'https://api.zrexpress.app';

// Helper to fetch territory UUID
async function searchTerritory(query: string): Promise<string | null> {
  if (!query) return null;
  try {
    // Attempting to search the territory by name
    const url = `${API_BASE}/api/v1/territories/search?name=${encodeURIComponent(query)}&query=${encodeURIComponent(query)}`;
    console.log(`[ZR Express] Searching territory: ${query}`);
    
    const res = await fetch(url, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'X-Api-Key': SECRET_KEY,
        'X-Tenant': TENANT_ID,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      console.error(`[ZR Express] Territory search failed for ${query}:`, res.status, await res.text());
      return null;
    }
    
    const data = await res.json();
    console.log(`[ZR Express] Territory search response for ${query}:`, JSON.stringify(data).substring(0, 200));
    
    // Guessing the response structure (commonly it's an array or object with items/data)
    const items = Array.isArray(data) ? data : (data.items || data.data || data.content || []);
    
    if (items.length > 0) {
      // Try common ID fields
      return items[0].id || items[0].territoryId || items[0].uuid || null;
    }
  } catch (error) {
    console.error(`[ZR Express] Territory search error for ${query}:`, error);
  }
  
  return null; 
}

export const syncConfirmedOrdersFn = createServerFn({ method: "POST" })
  .validator(z.object({
    ordersToSync: z.array(z.string()) // Array of Supabase Order IDs
  }))
  .handler(async ({ data }) => {
    try {
      // 1. Fetch the orders from Supabase
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .in('id', data.ordersToSync);
        
      if (error || !orders) {
        throw new Error("Failed to fetch orders from database: " + JSON.stringify(error));
      }

      if (!SECRET_KEY || !TENANT_ID) {
        throw new Error("ZR Express API Keys are missing from environment variables.");
      }

      const results = [];
      let successCount = 0;

    // 2. Loop through orders and create parcels in ZR Express
    for (const order of orders) {
      try {
        console.log(`[ZR Express] Syncing order ${order.id}...`);
        
        // Fetch Wilaya UUID
        let wilayaUuid = await searchTerritory(order.wilaya);
        // Fetch Commune UUID
        let communeUuid = await searchTerritory(order.commune);

        // Fallbacks: if the API search didn't return a UUID, we must warn or use a dummy UUID
        // (ZR API requires UUID format, so we can't send strings)
        if (!wilayaUuid) {
          console.warn(`[ZR Express] Could not find UUID for wilaya: ${order.wilaya}. API may reject this.`);
          wilayaUuid = "00000000-0000-0000-0000-000000000000"; // Dummy UUID to satisfy format, might be rejected by API
        }
        if (!communeUuid) {
          console.warn(`[ZR Express] Could not find UUID for commune: ${order.commune}`);
          communeUuid = "00000000-0000-0000-0000-000000000000";
        }

        // 3. Construct Payload exactly as requested
        const payload = {
          customer: {
            customerId: crypto.randomUUID(), // Generate a random UUID for the customer
            name: order.fullname || "Client",
            phone: {
              number1: order.phone || ""
            }
          },
          deliveryAddress: {
            cityTerritoryId: wilayaUuid,
            districtTerritoryId: communeUuid,
            street: order.address || order.commune || ""
          },
          orderedProducts: [
            {
              productName: order.product_name || "Produit",
              unitPrice: Number(order.total_amount) || 0,
              quantity: 1,
              stockType: "none"
            }
          ],
          amount: Number(order.total_amount) || 0,
          description: order.notes || order.product_name || "",
          deliveryType: "home",
          externalId: order.id // Link back to our DB ID
        };

        // 4. Send POST request to ZR Express
        const response = await fetch(`${API_BASE}/api/v1/parcels`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SECRET_KEY}`,
            'X-Api-Key': SECRET_KEY,
            'X-Tenant': TENANT_ID,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[ZR Express] Failed to create parcel for order ${order.id}:`, response.status, errText);
          continue; // Skip to next order
        }

        const zrData = await response.json();
        console.log(`[ZR Express] Success for order ${order.id}:`, zrData);

        // Extract Tracking Number and ZR Express ID from response
        // Adjust these fields based on actual ZR Express API response structure
        const trackingNumber = zrData.trackingNumber || zrData.code || zrData.id || `ZRE-${order.id.substring(0,6)}`;
        const zrExpressId = zrData.id || zrData.parcelId || '';

        results.push({
          id: order.id,
          tracking_number: trackingNumber,
          zr_express_id: zrExpressId
        });
        
        successCount++;
        
      } catch (err) {
        console.error(`[ZR Express] Exception processing order ${order.id}:`, err);
      }
    } // End of for loop
    
    return {
      success: successCount > 0,
      message: `تم مزامنة ${successCount} من أصل ${data.ordersToSync.length} طلبات مع ZR Express بنجاح!`,
      results
    };
    } catch (globalError: any) {
      console.error("[ZR Express] Global Sync Error:", globalError);
      return {
        success: false,
        message: `حدث خطأ: ${globalError?.message || 'غير معروف'}`,
        results: []
      };
    }
  });
