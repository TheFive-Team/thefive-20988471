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

// Safely extract territory string from string or object
function extractTerritoryName(value: any): string {
  if (!value) return "";
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') return String(value.name || value.nameAr || value.nameFr || value.title || value.code || "").trim();
  return String(value).trim();
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

// Phone Number Normalization to clean flat Algerian local format (e.g. 0724426898)
function normalizePhoneLocal(phoneInput: any): string | null {
  if (!phoneInput) return null;

  let rawPhone = typeof phoneInput === 'object' 
    ? (phoneInput.number1 || phoneInput.phone || phoneInput.number || String(phoneInput)) 
    : String(phoneInput);

  let clean = rawPhone.replace(/[^\d+]/g, '').trim();

  if (clean.startsWith('+213')) {
    clean = '0' + clean.substring(4);
  } else if (clean.startsWith('213') && clean.length >= 11) {
    clean = '0' + clean.substring(3);
  } else if (!clean.startsWith('0') && /^[567]\d{8}$/.test(clean)) {
    clean = '0' + clean;
  }

  if (!/^0[567]\d{8}$/.test(clean)) {
    if (/^0\d{9}$/.test(clean)) {
      return clean;
    }
    clean = clean.replace(/^\+?213/, '');
    if (!clean.startsWith('0')) clean = '0' + clean;
    if (clean.length < 9) return null;
  }

  return clean;
}

// Safely flattens size input (string, string[], object[], or JSON string) into a flat clean string joined by ' + '
function safeFormatSizes(sizesInput: any): string {
  if (!sizesInput) return "";

  if (Array.isArray(sizesInput)) {
    return sizesInput
      .map(item => (typeof item === 'object' && item !== null ? (item.title || item.name || JSON.stringify(item)) : String(item)))
      .filter(Boolean)
      .join(' + ');
  }

  if (typeof sizesInput === 'string') {
    const trimmed = sizesInput.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map(item => (typeof item === 'object' && item !== null ? (item.title || item.name || JSON.stringify(item)) : String(item)))
            .filter(Boolean)
            .join(' + ');
        }
      } catch (e) {
        // Not a JSON array, return raw trimmed string
      }
    }
    return trimmed;
  }

  if (typeof sizesInput === 'object') {
    return sizesInput.title || sizesInput.name || String(sizesInput);
  }

  return String(sizesInput);
}

// Safely formats product name and sizes into a flat string e.g. "Ensemble d'été (5-6 سنوات + 7-8 سنوات)"
function safeFormatProductName(rawProductName: any, rawSizes: any, rawVariantTitle: any): string {
  const baseName = typeof rawProductName === 'string' 
    ? rawProductName.trim() 
    : (Array.isArray(rawProductName) ? rawProductName.join(' + ') : String(rawProductName || "Produit"));

  const formattedSizes = safeFormatSizes(rawSizes) || safeFormatSizes(rawVariantTitle);

  if (formattedSizes) {
    if (baseName.includes(formattedSizes)) {
      return baseName;
    }
    return `${baseName} (${formattedSizes})`;
  }

  return baseName;
}

// Multi-Item Aggregation for ZR Payload description
function safeFormatDescription(order: any): string {
  let parts: string[] = [];

  // Check if order has items or products array
  const itemList = Array.isArray(order.items) ? order.items : Array.isArray(order.products) ? order.products : null;

  if (itemList && itemList.length > 0) {
    const itemDescriptions = itemList.map((item: any) => {
      const title = item.title || item.product_name || item.name || order.product_name || "Produit";
      const size = item.size || item.selected_size || item.variant_title || safeFormatSizes(item.sizes);
      return size ? `${title} (${size})` : title;
    });
    parts.push(itemDescriptions.join(' + '));
  } else {
    const rawName = typeof order.product_name === 'string' ? order.product_name.trim() : String(order.product_name || "Produit");
    parts.push(rawName);

    if (order.selected_offer_title && typeof order.selected_offer_title === 'string') {
      parts.push(order.selected_offer_title.trim());
    }

    const formattedSizes = safeFormatSizes(order.sizes || order.selected_sizes) || safeFormatSizes(order.variant_title);
    if (formattedSizes) {
      parts.push(`المقاسات: ${formattedSizes}`);
    }
  }

  if (order.notes) {
    const notesStr = typeof order.notes === 'string' ? order.notes.trim() : String(order.notes);
    if (notesStr) parts.push(`ملاحظات: ${notesStr}`);
  }

  return parts.join(" - ");
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
            // ROOT-LEVEL METADATA EXTRACTION (CRITICAL)
            const rawDeliveryType = order.delivery_type || order.shipping_type || order.deliveryType || 'home';
            const deliveryTypeStr = String(rawDeliveryType).toLowerCase();
            const isStopDesk = /استلام|desk|pickup|office/i.test(deliveryTypeStr);
            const finalDeliveryType = isStopDesk ? "pickup-point" : "home";

            let deskNameFromType = "";
            if (isStopDesk && typeof rawDeliveryType === 'string' && rawDeliveryType.includes(" - ")) {
              deskNameFromType = rawDeliveryType.split(" - ").slice(1).join(" - ").trim();
            }

            const deskObj = order.selectedDesk || (order.selectedDeskName ? { 
              name: order.selectedDeskName, 
              wilaya: order.selectedDeskWilaya,
              commune: order.selectedDeskCommune,
              address: order.selectedDeskAddress,
              id: order.selectedDeskId
            } : deskNameFromType ? { name: deskNameFromType } : null);

            // Customer Name & Phone Normalization directly from root parent order
            const customerName = order.fullname || order.customer_name || order.customer_info?.name || "Client";
            const cleanPhone = normalizePhoneLocal(
              order.phone || order.customer_phone || order.phone_number || order.customer_info?.phone
            );

            // Multi-path fallback checking for shipping fields directly from root parent order
            const rawWilaya = (isStopDesk && (deskObj?.wilaya || deskObj?.wilaya_name))
              || order.wilaya
              || order.shipping_wilaya
              || order.customer_info?.wilaya
              || order.customer_wilaya
              || order.wilaya_name
              || order.selectedDeskWilaya
              || order.wilayaName
              || order.city
              || "";
            const targetWilaya = extractTerritoryName(rawWilaya);

            const rawCommune = (isStopDesk && (deskObj?.commune || deskObj?.commune_name))
              || order.commune
              || order.shipping_commune
              || order.customer_info?.commune
              || order.customer_commune
              || order.commune_name
              || order.selectedDeskCommune
              || order.communeName
              || order.district
              || order.address
              || "";
            const targetCommune = extractTerritoryName(rawCommune);

            // Pre-Flight Payload Validation Guard (CRITICAL)
            if (!targetWilaya || !targetCommune || !cleanPhone) {
              const missingMsg = "Wilaya, Commune, and Phone are required for ZR Express sync.";
              console.error(`[PRE_FLIGHT_VALIDATION_FAILED] Order ${order.id}: ${missingMsg}`, {
                targetWilaya,
                targetCommune,
                cleanPhone
              });
              results.push({
                success: false,
                id: order.id,
                stage: "PRE_FLIGHT_VALIDATION",
                code: "MISSING_REQUIRED_FIELDS",
                message: "عذراً، بيانات الولاية أو البلدية مفقودة لهذا الطلب في لوحة التحكم",
                debugContext: {
                  targetWilaya,
                  targetCommune,
                  phoneStr: cleanPhone || "",
                  customerName
                }
              });
              continue;
            }

            if (isStopDesk && !deskObj?.name && !deskObj?.id) {
               console.warn(`[ORDER_VALIDATION_FAILED] Missing desk info for Stop Desk order ${order.id}`);
               results.push({ success: false, id: order.id, stage: "VALIDATION", code: "INVALID_DESK", message: "يرجى اختيار مكتب التوصيل" });
               continue;
            }

            console.log("[ORDER_VALIDATED] Pre-flight payload validation passed.");

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

            const targetStreet = isStopDesk && deskObj?.address ? String(deskObj.address) : String(order.address || targetCommune || targetWilaya);
            
            const formattedProductName = safeFormatProductName(order.product_name, order.sizes || order.selected_sizes, order.variant_title);
            const productDescription = safeFormatDescription(order);
            const itemQuantity = Math.max(1, Number(order.quantity || order.selected_offer_pieces || (Array.isArray(order.items) ? order.items.length : 1)) || 1);
            
            // Multi-Item Price Calculation safely summed as number
            const totalAmount = Number(order.total_amount ?? order.total_price ?? order.finalTotal ?? 0) || 0;

            const finalPayload: any = {
              customer: {
                customerId: crypto.randomUUID(), // strictly customerId with capital 'I'
                name: String(customerName),
                phone: String(cleanPhone)
              },
              phone: String(cleanPhone),
              deliveryAddress: {
                cityTerritoryId: String(wilayaUuid),
                districtTerritoryId: String(communeUuid),
                street: String(targetStreet)
              },
              orderedProducts: [
                {
                  productName: String(formattedProductName),
                  unitPrice: totalAmount,
                  quantity: itemQuantity,
                  stockType: "none"
                }
              ],
              amount: totalAmount,
              description: String(productDescription),
              deliveryType: String(finalDeliveryType),
              externalId: String(order.id)
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
              finalPayload.hubId = String(finalHubId);
            }

            console.log(`[ZR_PAYLOAD_BUILT] Prepared payload for order ${order.id}.`);
            console.log('[FINAL_ZR_PAYLOAD]', JSON.stringify(finalPayload));
            
            console.log(`[ZR_REQUEST_SENT] Sending request to ${API_BASE}/api/v1/parcels`);
            const response = await fetch(`${API_BASE}/api/v1/parcels`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'X-Api-Key': API_KEY,
                'X-Tenant': TENANT_ID,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(finalPayload)
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
                payload: finalPayload,
                responseBody: rawBody,
                debugContext: {
                   status: response.status,
                   statusText: response.statusText,
                   body: rawBody,
                   targetWilaya,
                   targetCommune,
                   phoneStr: cleanPhone,
                   customerName,
                   deliveryType: finalDeliveryType
                }
              });
              continue;
            }
  
            zrData = JSON.parse(rawBody);
            console.log(`[ZR_SUCCESS] Successfully synced order ${order.id}`);
          }

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
            .update(updatePayload)
            .eq('id', order.id);

          if (updateError) {
             console.error(`[ORDER_UPDATE_FAILED] Failed to update tracking in Supabase for ${order.id}:`, updateError);
             results.push({
               success: false,
               id: order.id,
               stage: "DB_UPDATE",
               code: updateError.code || "DB_UPDATE_ERROR",
               message: "فشل تحديث رقم تتبع ZR Express في قاعدة البيانات",
               details: updateError.message,
               trackingNumber
             });
          } else {
             console.log(`[ORDER_UPDATE_SUCCESS] Successfully updated tracking ${trackingNumber} for ${order.id}. Rows affected: ${count}`);
             successCount++;
             results.push({
               success: true,
               id: order.id,
               stage: "COMPLETE",
               code: "SUCCESS",
               message: "تمت مزامنة الطلب بنجاح وتوليد رقم التتبع",
               trackingNumber,
               zrExpressId
             });
          }

        } catch (singleError: any) {
          console.error(`[CRITICAL_UNHANDLED_ORDER_ERROR] Error on order ${order.id}:`, singleError);
          results.push({
             success: false,
             id: order.id,
             stage: "UNHANDLED_EXCEPTION",
             code: singleError.name || "UNKNOWN_EXCEPTION",
             message: singleError.message || "خطأ عام غير متوقع أثناء معالجة الطلب"
          });
        }
      }

      console.log(`[SYNC_COMPLETED] Processed ${orders.length} orders. Successes: ${successCount}`);
      return {
        success: successCount > 0,
        message: `تمت مزامنة ${successCount} من أصل ${orders.length} طلبات بنجاح.`,
        successCount,
        failedCount: orders.length - successCount,
        results
      };

    } catch (err: any) {
      console.error("[CRITICAL_SYNC_SYSTEM_FAILURE] Unhandled crash in syncConfirmedOrdersFn:", err);
      return {
        success: false,
        message: `خطأ في النظام: ${err.message || "حدث خطأ أثناء الاتصال بمزود الخدمة"}`,
        results: []
      };
    }
  });
