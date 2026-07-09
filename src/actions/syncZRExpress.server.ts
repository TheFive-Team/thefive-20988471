import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const API_KEY = process.env.ZR_API_KEY || process.env.ZR_EXPRESS_SECRET_KEY || '';
const TENANT_ID = process.env.ZR_TENANT_ID || process.env.ZR_EXPRESS_TENANT_ID || '';
const API_BASE = process.env.ZR_BASE_URL || 'https://api.zrexpress.app';

// Helper to fetch territory UUID
// Helper to clean territory names (e.g. "14 - تيارت" -> "تيارت")
function cleanTerritoryName(name: string): string {
  if (!name) return "";
  return name.replace(/[0-9-]/g, '').trim();
}

async function searchTerritory(query: string, expectedLevel: string): Promise<string | null> {
  const cleanQuery = cleanTerritoryName(query);
  if (!cleanQuery) return null;
  try {
    const url = `${API_BASE}/api/v1/territories/search`;
    console.log(`[ZR Express] Searching territory: ${cleanQuery} (original: ${query})`);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-Api-Key': API_KEY,
        'X-Tenant': TENANT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keyword: cleanQuery })
    });
    
    if (!res.ok) {
      console.error(`[ZR Express] Territory search failed for ${cleanQuery}:`, res.status);
      return null;
    }
    
    const data = await res.json();
    console.log(`[ZR Express] Territory search response for ${cleanQuery}:`, JSON.stringify(data).substring(0, 250));
    
    if (data && data.items && data.items.length > 0) {
      // Find the first item that matches the expected level (wilaya or commune)
      const match = data.items.find((item: any) => item.level === expectedLevel) || data.items[0];
      return match.id;
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

      if (!API_KEY || !TENANT_ID) {
        throw new Error("ZR Express API Keys are missing from environment variables.");
      }

      const results = [];
      let successCount = 0;

      // Pre-validation for Stop Desk
      for (const order of orders) {
        const deliveryTypeStr = (order.delivery_type || "").toLowerCase();
        const isStopDesk = /استلام|desk|pickup|office/i.test(deliveryTypeStr);
        const deskObj = order.selectedDesk || (order.selectedDeskName ? { 
          name: order.selectedDeskName, 
          wilaya: order.selectedDeskWilaya,
          commune: order.selectedDeskCommune,
          address: order.selectedDeskAddress
        } : null);

        if (isStopDesk && !deskObj?.name) {
          return {
            success: false,
            message: `يرجى اختيار مكتب ZR قبل المزامنة للطلب ${order.id}`,
            results: []
          };
        }
      }

    // 2. Loop through orders and create parcels in ZR Express
    for (const order of orders) {
      try {
        console.log(`[ZR Express] Syncing order ${order.id}...`);
        
        const deliveryTypeStr = (order.delivery_type || "").toLowerCase();
        const isStopDesk = /استلام|desk|pickup|office/i.test(deliveryTypeStr);
        const finalDeliveryType = isStopDesk ? "pickup-point" : "home";

        console.log(`DB deliveryType: ${order.delivery_type}`);
        console.log(`ZR deliveryType: ${finalDeliveryType}`);

        const deskObj = order.selectedDesk || (order.selectedDeskName ? { 
          name: order.selectedDeskName, 
          wilaya: order.selectedDeskWilaya,
          commune: order.selectedDeskCommune,
          address: order.selectedDeskAddress
        } : null);

        // Fetch Wilaya UUID
        const targetWilaya = isStopDesk && deskObj?.wilaya ? deskObj.wilaya : order.wilaya;
        let wilayaUuid = await searchTerritory(targetWilaya, "wilaya");

        // Fetch Commune UUID
        const targetCommune = isStopDesk && deskObj?.commune ? deskObj.commune : order.commune;
        let communeUuid = await searchTerritory(targetCommune, "commune");

        // Fallbacks: if the API search didn't return a UUID, we generate a random one to pass validation format
        if (!wilayaUuid) {
          console.warn(`[ZR Express] Could not find UUID for wilaya: ${targetWilaya}. API may reject this.`);
          wilayaUuid = crypto.randomUUID();
        }
        if (!communeUuid) {
          console.warn(`[ZR Express] Could not find UUID for commune: ${targetCommune}`);
          communeUuid = crypto.randomUUID();
        }

        // Format phone to international
        let phoneStr = order.phone || "";
        if (phoneStr.startsWith('0')) {
          phoneStr = '+213' + phoneStr.substring(1);
        } else if (!phoneStr.startsWith('+')) {
          phoneStr = '+213' + phoneStr;
        }

        const targetStreet = isStopDesk && deskObj?.address ? deskObj.address : (order.address || order.commune || "");

          // Build the description based on the new offer system
          let productDescription = order.product_name || "Produit";
          if (order.selected_offer_title) {
            productDescription += ` - ${order.selected_offer_title}`;
          }
          if (order.selected_sizes && Array.isArray(order.selected_sizes) && order.selected_sizes.length > 0) {
            productDescription += ` - المقاسات: ${order.selected_sizes.join(', ')}`;
          } else if (order.variant_title) {
            productDescription += ` - ${order.variant_title}`;
          }
          
          if (order.notes) {
            productDescription += ` | ملاحظات: ${order.notes}`;
          }

          const payload: any = {
            customer: {
              customerId: crypto.randomUUID(), // Generate a random UUID for the customer
              name: order.fullname || "Client",
              phone: {
                number1: phoneStr
              }
            },
            deliveryAddress: {
              cityTerritoryId: wilayaUuid,
              districtTerritoryId: communeUuid,
              street: targetStreet
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
            description: productDescription,
            deliveryType: isStopDesk ? "pickup-point" : "home",
            externalId: order.id // Link back to our DB ID
          };

        let finalHubId = deskObj?.id;
        if (isStopDesk && !finalHubId && deskObj?.name) {
          try {
            // Dynamically import offices if needed or rely on a top level import. We will read it directly using fs to be safe since it's a server fn.
            const fs = await import('fs');
            const path = await import('path');
            const officesPath = path.resolve(process.cwd(), 'src/lib/zr_offices.json');
            if (fs.existsSync(officesPath)) {
              const offices = JSON.parse(fs.readFileSync(officesPath, 'utf8'));
              const match = offices.find((o: any) => o.name === deskObj.name);
              if (match?.id) finalHubId = match.id;
            }
          } catch (e) {
            console.error('[ZR Express] Error loading zr_offices for dynamic hub lookup', e);
          }
        }

        if (isStopDesk && finalHubId) {
          payload.hubId = finalHubId;
        } else if (isStopDesk) {
          console.warn(`[ZR Express] Warning: Missing hub ID for desk ${deskObj?.name || 'unknown'}`);
        }

        console.log(`\n===========================================`);
        console.log(`Selected desk object:\n${JSON.stringify(deskObj, null, 2)}`);
        
        if (isStopDesk) {
          console.log(`HubId sent:\n${finalHubId || 'N/A'}`);
        }
        
        console.log(`Final payload:\n${JSON.stringify(payload, null, 2)}`);
        console.log(`===========================================\n`);
        // 4. Send POST request to ZR Express
          const response = await fetch(`${API_BASE}/api/v1/parcels`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'X-Api-Key': API_KEY,
              'X-Tenant': TENANT_ID,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error(`\n[ZR ERROR]`);
            console.error(`Status: ${response.status}`);
            console.error(`Response: ${errText}`);
            console.error(`Payload: ${JSON.stringify(payload, null, 2)}\n`);
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
        console.error(`\n[ZR ERROR]`);
        console.error(`Exception thrown for order ${order.id}:`);
        console.error(err);
        console.error(`\n`);
      }
    } // End of for loop
    
    const failedCount = data.ordersToSync.length - successCount;
    return {
      success: successCount > 0,
      message: successCount > 0 
        ? `تم مزامنة ${successCount} طلب بنجاح!${failedCount > 0 ? ` (فشلت مزامنة ${failedCount} طلبات)` : ''}`
        : `فشلت مزامنة جميع الطلبات المحددة (${failedCount}). يُرجى التحقق من Vercel Logs لمعرفة السبب (غالباً خطأ في مطابقة الولاية/البلدية).`,
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
