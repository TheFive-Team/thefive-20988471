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

      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      
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

          if (!response.ok) {
            const errText = await response.text();
            console.error(`[SYNC_FAILED_AT: ZR_RESPONSE_RECEIVED] Status: ${response.status}`);
            console.error(`[ZR ERROR] ${errText}`);
            
            let sanitizedError = errText;
            try {
               const parsedErr = JSON.parse(errText);
               sanitizedError = parsedErr.message || JSON.stringify(parsedErr);
            } catch (e) {}

            results.push({ 
              success: false, 
              id: order.id, 
              stage: "ZR_REQUEST", 
              code: response.status >= 500 ? "ZR_SERVER_ERROR" : "ZR_BAD_REQUEST", 
              message: "رفض ZR Express الطلب", 
              details: sanitizedError.substring(0, 200)
            });
            continue; 
          }

          const zrData = await response.json();
          console.log(`[ZR_RESPONSE_RECEIVED] Success for order ${order.id}. HTTP 200/201`);

          const trackingNumber = zrData.trackingNumber || zrData.code || zrData.id || `ZRE-${order.id.substring(0,6)}`;
          const zrExpressId = zrData.id || zrData.parcelId || '';

          console.log(`[ORDER_UPDATE_STARTED] Updating Supabase for ${order.id} with tracking: ${trackingNumber}`);
          const { error: updateError } = await authSupabase.from('orders').update({
             tracking_number: trackingNumber,
             zr_express_id: zrExpressId
          }).eq('id', order.id);

          if (updateError) {
             console.error(`[SYNC_FAILED_AT: ORDER_UPDATE_DONE] DB update failed for ${order.id}:`, updateError);
             results.push({ 
               success: false, 
               id: order.id, 
               stage: "DB_UPDATE", 
               code: "DATABASE_UPDATE_FAILED", 
               message: "تم إنشاء الطرد في ZR ولكن فشل حفظ التتبع في قاعدة البيانات", 
               trackingNumber,
               zrExpressId
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
            details: err?.message?.substring(0, 100) 
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
