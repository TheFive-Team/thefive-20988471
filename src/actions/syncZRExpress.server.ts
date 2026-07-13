import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabase as defaultSupabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const API_KEY = process.env.ZR_API_KEY || process.env.ZR_EXPRESS_SECRET_KEY || '';
const TENANT_ID = process.env.ZR_TENANT_ID || process.env.ZR_EXPRESS_TENANT_ID || '';
const API_BASE = process.env.ZR_BASE_URL || 'https://api.zrexpress.app';

// Helper to clean territory names
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
    if (data && data.items && data.items.length > 0) {
      const match = data.items.find((item: any) => item.level === expectedLevel) || data.items[0];
      return match.id;
    }
  } catch (error) {
    console.error(`[ZR Express] Territory search error for ${query}:`, error);
  }
  
  return null; 
}

function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  let clean = phone.replace(/[\s-]/g, '');
  if (clean.startsWith('0')) {
    clean = '+213' + clean.substring(1);
  } else if (!clean.startsWith('+')) {
    clean = '+213' + clean;
  }
  if (clean.length < 10) return null;
  return clean;
}

export const syncConfirmedOrdersFn = createServerFn({ method: "POST" })
  .validator(z.object({
    ordersToSync: z.array(z.string())
  }))
  .handler(async ({ data }) => {
    console.log("[SYNC_REQUEST_RECEIVED] Starting ZR Express sync for orders:", data.ordersToSync);

    try {
      if (!API_KEY || !TENANT_ID) {
        console.error("[ZR_CREDENTIALS_MISSING] Missing ZR Express API credentials in environment.");
        return {
          success: false,
          message: "بيانات الدخول إلى ZR Express غير موجودة في Vercel Production.",
          results: []
        };
      }
      console.log("[AUTH_OK] Credentials found.");

      const token = getCookie("sb-access-token");
      if (!token) {
        console.error("[AUTH_ERROR] No auth token found for server action.");
        return {
          success: false,
          message: "جلسة غير صالحة. يرجى تسجيل الدخول مجدداً.",
          results: []
        };
      }

      // Reuse the statically resolved URL and Key from the default client to avoid Vercel process.env undefined errors
      const supabaseUrl = defaultSupabase.supabaseUrl;
      const supabaseAnonKey = defaultSupabase.supabaseKey;
      
      const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

      const { data: orders, error } = await authSupabase
        .from('orders')
        .select('*')
        .in('id', data.ordersToSync);
        
      if (error || !orders || orders.length === 0) {
        console.error("[DATABASE_ERROR] Failed to load orders or empty array returned:", error);
        return {
          success: false,
          message: `لم يتم العثور على الطلبات في قاعدة البيانات (ربما بسبب صلاحيات RLS). تم طلب ${data.ordersToSync.length} طلبات، وتم إيجاد ${orders?.length || 0}.`,
          results: data.ordersToSync.map(id => ({
            success: false,
            id,
            stage: "DB_LOAD",
            code: "RLS_BLOCK",
            message: "الطلب غير موجود أو محجوب بصلاحيات RLS"
          }))
        };
      }
      console.log(`[ORDER_LOADED] Loaded ${orders.length} orders from Supabase.`);

      const results = [];
      let successCount = 0;

      for (const order of orders) {
        try {
          console.log(`\n--- Processing Order ${order.id} ---`);
          
          if (order.tracking_number && String(order.tracking_number).startsWith("ZRE")) {
             console.log(`[ORDER_SKIPPED] Order ${order.id} already synced.`);
             results.push({
               success: true,
               id: order.id,
               stage: "PRE_SYNC",
               code: "ALREADY_SYNCED",
               message: "تمت مزامنة الطلب مسبقاً",
               trackingNumber: order.tracking_number
             });
             continue;
          }

          // 1. Check if ZR Express parcel already exists to prevent duplicates
          console.log(`[ZR_REQUEST_SENT] Checking if shipment already exists for order ${order.id}...`);
          const searchRes = await fetch(`${API_BASE}/api/v1/parcels/search`, {
            method: 'POST',
            headers: {
              'X-Api-Key': API_KEY,
              'X-Tenant': TENANT_ID,
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ keyword: order.id })
          });
          
          let existingParcel = null;
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData && searchData.items && searchData.items.length > 0) {
              existingParcel = searchData.items.find((i: any) => i.externalId === order.id || i.description?.includes(order.id));
              if (!existingParcel) {
                existingParcel = searchData.items[0]; // fallback to first match
              }
              console.log(`[ZR_DUPLICATE_PREVENTED] Found existing shipment for order ${order.id} (ZR ID: ${existingParcel.id}, Tracking: ${existingParcel.trackingNumber})`);
            }
          }

          let zrData: any = null;

          if (existingParcel) {
             zrData = existingParcel;
          } else {
            const deliveryTypeStr = (order.delivery_type || "").toLowerCase();
            const isStopDesk = /استلام|desk|pickup|office/i.test(deliveryTypeStr);
            const finalDeliveryType = isStopDesk ? "pickup-point" : "home";

            let deskNameFromType = "";
            if (isStopDesk && order.delivery_type && order.delivery_type.includes(" - ")) {
              deskNameFromType = order.delivery_type.split(" - ").slice(1).join(" - ").trim();
            }

            const deskObj = order.selectedDesk || (order.selectedDeskName ? { 
              name: order.selectedDeskName, 
              wilaya: order.selectedDeskWilaya,
              commune: order.selectedDeskCommune,
              address: order.selectedDeskAddress,
              id: order.selectedDeskId
            } : deskNameFromType ? { name: deskNameFromType } : null);

            // Validation
            const customerName = order.fullname || "Client";
            const phoneStr = normalizePhone(order.phone || "");
            if (!phoneStr) {
              console.warn(`[ORDER_VALIDATION_FAILED] Invalid phone for order ${order.id}`);
              results.push({ success: false, id: order.id, stage: "VALIDATION", code: "INVALID_PHONE", message: "رقم الهاتف غير صالح" });
              continue;
            }

            const targetWilaya = isStopDesk && deskObj?.wilaya ? deskObj.wilaya : order.wilaya;
            if (!targetWilaya) {
              console.warn(`[ORDER_VALIDATION_FAILED] Missing wilaya for order ${order.id}`);
              results.push({ success: false, id: order.id, stage: "VALIDATION", code: "INVALID_WILAYA", message: "الولاية مفقودة" });
              continue;
            }

            const targetCommune = isStopDesk && deskObj?.commune ? deskObj.commune : order.commune;
            if (!targetCommune) {
              console.warn(`[ORDER_VALIDATION_FAILED] Missing commune for order ${order.id}`);
              results.push({ success: false, id: order.id, stage: "VALIDATION", code: "INVALID_COMMUNE", message: "البلدية مفقودة" });
              continue;
            }

            if (isStopDesk && !deskObj?.name && !deskObj?.id) {
               console.warn(`[ORDER_VALIDATION_FAILED] Missing desk info for Stop Desk order ${order.id}`);
               results.push({ success: false, id: order.id, stage: "VALIDATION", code: "INVALID_DESK", message: "يرجى اختيار مكتب التوصيل" });
               continue;
            }

            console.log("[ORDER_VALIDATED] Payload data appears valid.");

            let wilayaUuid = await searchTerritory(targetWilaya, "wilaya");
            let communeUuid = await searchTerritory(targetCommune, "commune");

            if (!wilayaUuid) {
              wilayaUuid = crypto.randomUUID();
              console.log(`[ZR_MAPPING_WARNING] Random UUID used for Wilaya: ${targetWilaya}`);
            }
            if (!communeUuid) {
              communeUuid = crypto.randomUUID();
              console.log(`[ZR_MAPPING_WARNING] Random UUID used for Commune: ${targetCommune}`);
            }

            const targetStreet = isStopDesk && deskObj?.address ? deskObj.address : (order.address || order.commune || "");
            let productDescription = order.product_name || "Produit";
            if (order.selected_offer_title) productDescription += ` - ${order.selected_offer_title}`;
            if (order.selected_sizes && Array.isArray(order.selected_sizes) && order.selected_sizes.length > 0) {
              productDescription += ` - المقاسات: ${order.selected_sizes.join(', ')}`;
            } else if (order.variant_title) {
              productDescription += ` - ${order.variant_title}`;
            }
            if (order.notes) productDescription += ` | ملاحظات: ${order.notes}`;

            const payload: any = {
              customer: {
                customerId: crypto.randomUUID(),
                name: customerName,
                phone: { number1: phoneStr }
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
              deliveryType: finalDeliveryType,
              externalId: order.id
            };
            
            let finalHubId = deskObj?.id;
            if (isStopDesk && !finalHubId && deskObj?.name) {
              try {
                const fs = await import('fs');
                const path = await import('path');
                const officesPath = path.resolve(process.cwd(), 'src/lib/zr_offices.json');
                if (fs.existsSync(officesPath)) {
                  const offices = JSON.parse(fs.readFileSync(officesPath, 'utf8'));
                  const match = offices.find((o: any) => o.name === deskObj.name);
                  if (match?.id) finalHubId = match.id;
                }
              } catch (e) {
                console.error('[ZR_MAPPING_ERROR] Failed to map desk name to Hub ID:', e);
              }
            }

            if (isStopDesk && finalHubId) {
              payload.hubId = finalHubId;
            }

            console.log(`[ZR_PAYLOAD_BUILT] Prepared payload for ${order.id}. Keys: ${Object.keys(payload).join(', ')}`);
            
            console.log(`[ZR_REQUEST_SENT] Sending request to ${API_BASE}/api/v1/parcels`);
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
            
            console.log(`[ZR_RESPONSE_RECEIVED] Status: ${response.status} ${response.statusText} for order ${order.id}`);
            
            const rawBody = await response.text();
            
            if (!response.ok) {
              console.error(`[SYNC_FAILED_AT: ZR_REQUEST] ZR API Error for ${order.id}:`, rawBody);
              let errorMsg = "حدث خطأ غير معروف في واجهة ZR Express";
              try {
                const errObj = JSON.parse(rawBody);
                errorMsg = errObj.message || errObj.error || errorMsg;
              } catch (e) {}
              
              results.push({ 
                success: false, 
                id: order.id, 
                stage: "ZR_REQUEST", 
                code: `HTTP_${response.status}`, 
                message: "رفض ZR Express الطلب",
                details: errorMsg,
                payload: payload,
                responseBody: rawBody,
                debugContext: {
                   status: response.status,
                   statusText: response.statusText,
                   body: rawBody
                }
              });
              continue;
            }
  
            zrData = JSON.parse(rawBody);
            console.log(`[ZR_SUCCESS] Successfully synced order ${order.id}`);
          } // End of else (create new shipment)

          // 3. Update Supabase with Tracking Info
          const trackingNumber = zrData.trackingNumber || zrData.code || zrData.id || `ZRE-${order.id.substring(0,6)}`;
          const zrExpressId = zrData.id || zrData.parcelId || '';

          const updatePayload = {
             tracking_number: trackingNumber,
             zr_express_id: zrExpressId
          };
          
          console.log(`[ORDER_UPDATE_STARTED] Updating Supabase for ${order.id} with payload:`, updatePayload);
          const { error: updateError, count } = await authSupabase
            .from('orders')
            .update(updatePayload, { count: 'exact' })
            .eq('id', order.id);

          if (updateError || count === 0) {
             console.error(`[SYNC_FAILED_AT: ORDER_UPDATE_DONE] DB update failed for ${order.id}:`, updateError, "Count:", count);
             
             let failReason = "";
             const availableColumns = dbOrders && dbOrders.length > 0 ? Object.keys(dbOrders[0]).join(", ") : "unknown";
             
             if (updateError) {
                failReason = `Supabase Error: Code=${updateError.code}, Message=${updateError.message}, Details=${updateError.details}, Hint=${updateError.hint}`;
                if (updateError.code === '42703') {
                   failReason += `\n[CRITICAL SCHEMA ERROR] The column does not exist! The ONLY columns that actually exist in your database table are: ${availableColumns}. You MUST run ALTER TABLE in Supabase to add tracking_number and zr_express_id!`;
                }
             } else if (count === 0) {
                failReason = `Update returned count = 0. This means the WHERE clause (id = '${order.id}') matched no rows. This usually happens if the order ID is wrong, the row was deleted, or Row-Level Security (RLS) UPDATE policies blocked this user from modifying this row.`;
             }
             
             results.push({ 
               success: false, 
               id: order.id, 
               stage: "DB_UPDATE", 
               code: updateError?.code || (count === 0 ? "ZERO_ROWS" : "DATABASE_UPDATE_FAILED"), 
               message: failReason, 
               details: `Table: orders | WHERE: id = ${order.id} | Payload: ${JSON.stringify(updatePayload)}`,
               payload: updatePayload,
               responseBody: updateError ? JSON.stringify(updateError, null, 2) : "count = 0",
               debugContext: {
                 tableName: 'orders',
                 whereClause: `id = '${order.id}'`,
                 orderId: order.id,
                 updatePayload,
                 supabaseError: updateError,
                 rowCount: count
               }
             });
             continue;
          }

          console.log(`[ORDER_UPDATE_DONE] Successfully updated DB for ${order.id}`);
          results.push({
            success: true,
            id: order.id,
            stage: "SYNC_SUCCESS",
            code: "SUCCESS",
            message: "تمت المزامنة بنجاح",
            trackingNumber: trackingNumber,
            zrExpressId: zrExpressId
          });
          
          successCount++;
        } catch (err: any) {
          console.error(`[SYNC_FAILED_AT: UNKNOWN_SYNC_ERROR] Order ${order.id}:`, err);
          results.push({ 
            success: false, 
            id: order.id, 
            stage: "UNKNOWN", 
            code: "UNKNOWN_SYNC_ERROR", 
            message: "حدث خطأ غير متوقع", 
            details: err?.message,
            debugContext: {
              customerName: order.fullname,
              phone: order.phone,
              wilaya: order.wilaya,
              commune: order.commune,
              delivery_type: order.delivery_type
            }
          });
        }
      } 
      
      const failedCount = data.ordersToSync.length - successCount;
      return {
        success: true, // Master success determines if the call itself succeeded, not if every order synced
        message: "اكتملت عملية المزامنة",
        successCount,
        failedCount,
        results
      };
    } catch (globalError: any) {
      console.error("[SYNC_FAILED_AT: GLOBAL_ERROR]", globalError);
      return {
        success: false,
        message: `حدث خطأ عام: ${globalError?.message || 'غير معروف'}`,
        results: []
      };
    }
  });
