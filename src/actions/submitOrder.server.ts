import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import crypto from 'crypto';

export const submitOrderFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fullname: z.string(),
      phone: z.string(),
      wilaya: z.string(),
      commune: z.string(),
      address: z.string().optional(),
      deliveryType: z.string().optional(),
      variantId: z.string().optional(),
      productPriceAmount: z.string().optional(),
      productName: z.string().optional(),
      variantTitle: z.string().optional(),
      deliveryFee: z.number().optional(),
      eventId: z.string().optional(),
      clientUserAgent: z.string().optional(),
      eventSourceUrl: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    console.log("Received new order:", data);

    try {
      const orderId = `ORD-${Date.now()}`;
      
      const productFee = Number(data.productPriceAmount) || 0;
      // Use exact delivery fee from frontend or fallback to 600 DZD
      const deliveryFee = data.deliveryFee !== undefined ? data.deliveryFee : (data.wilaya ? 600 : 0); 
      const totalAmount = productFee + deliveryFee;

      // Insert into Supabase
      const { error } = await supabase.from('orders').insert({
        order_id: orderId,
        fullname: data.fullname,
        phone: data.phone,
        wilaya: data.wilaya,
        commune: data.commune,
        address: data.address || "",
        product_name: data.productName || "",
        variant_title: data.variantTitle || "",
        total_amount: totalAmount,
        delivery_type: data.deliveryType || "توصيل للمنزل",
        delivery_fee: deliveryFee,
        status: "pending"
      });

      if (error) {
        console.error("Supabase insert error:", error);
        return { success: false, message: "Failed to save order to database." };
      }

      console.log(`Successfully saved order ${orderId} to Supabase`);
      console.log("[Order] Supabase insert success");

      // Backup: Send to Google Sheets (via Apps Script Webhook)
      const googleWebhookUrl = "https://script.google.com/macros/s/AKfycbzgry3EWQHvZLjudmmR_J7hkqO5fBLi4F3HqO3Iy1hGx28Gz3HchBKyI0xbVNCVtGeg/exec";
      try {
        const sheetResponse = await fetch(googleWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            fullname: data.fullname,
            phone: data.phone,
            wilaya: data.wilaya,
            commune: data.commune,
            address: data.address || "",
            deliveryType: data.deliveryType || "توصيل للمنزل",
            productPriceAmount: totalAmount,
            productName: data.productName || "",
            variantTitle: data.variantTitle || ""
          }),
        });
        
        if (!sheetResponse.ok) {
          console.warn("Failed to send order to Google Sheets:", await sheetResponse.text());
        } else {
          console.log("Successfully backed up order to Google Sheets");
        }
      } catch (sheetError) {
        console.error("Error communicating with Google Sheets Webhook:", sheetError);
      }

      // Meta Conversions API (CAPI) Tracking
      try {
        console.log('--- Meta CAPI started ---');
        const pixelId = process.env.VITE_META_PIXEL_ID || process.env.META_PIXEL_ID;
        const accessToken = process.env.META_ACCESS_TOKEN;
        
        console.log('[Meta CAPI] checking env and eventId');
        console.log(`[Meta CAPI] pixelId exists: ${!!pixelId}`);
        console.log(`[Meta CAPI] accessToken exists: ${!!accessToken}`);
        console.log(`[Meta CAPI] eventId exists: ${!!data.eventId}`);

        if (pixelId && accessToken && data.eventId) {
          console.log(`[Meta CAPI] Pixel ID: ${pixelId}`);
          console.log(`[Meta CAPI] Event ID: ${data.eventId}`);
          console.log(`[Meta CAPI] Order ID: ${orderId}`);
          const clientUserAgent = data.clientUserAgent || '';
          const eventSourceUrl = data.eventSourceUrl || '';

          const hashData = (val: string) => {
            if (!val) return '';
            return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
          };

          const nameParts = data.fullname.trim().split(/\s+/);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          const phoneClean = data.phone.replace(/\s+/g, '');
          const phone = phoneClean.startsWith('0') ? `213${phoneClean.substring(1)}` : phoneClean;

          const payload = {
            data: [{
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              event_id: data.eventId,
              action_source: 'website',
              event_source_url: eventSourceUrl,
              user_data: {
                client_user_agent: clientUserAgent,
                ph: [hashData(phone)],
                fn: [hashData(firstName)],
                ln: [hashData(lastName)],
              },
              custom_data: {
                currency: 'DZD',
                value: totalAmount,
                order_id: orderId,
                content_name: data.productName || '',
                content_ids: data.variantTitle ? [data.variantTitle] : [],
                contents: data.variantTitle ? [{ id: data.variantTitle, quantity: 1 }] : [],
              }
            }]
          };

          const graphApiEndpoint = `https://graph.facebook.com/v20.0/${pixelId}/events`;
          console.log(`[Meta CAPI] Graph API endpoint: ${graphApiEndpoint}`);

          const capiResponse = await fetch(`${graphApiEndpoint}?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          console.log(`[Meta CAPI] Meta response status: ${capiResponse.status} ${capiResponse.statusText}`);
          const responseBody = await capiResponse.text();
          console.log(`[Meta CAPI] Meta response body: ${responseBody}`);
          
          if (!capiResponse.ok) {
            console.error('[Meta CAPI] Error:', responseBody);
          } else {
            console.log('✅ Successfully sent Purchase event to Meta CAPI');
          }
        } else {
          console.log(`[Meta CAPI] skipped because: missing pixelId=${!pixelId}, accessToken=${!accessToken}, eventId=${!data.eventId}`);
        }
      } catch (capiError) {
        console.error('[Meta CAPI] Exception:', capiError);
      }

      return {
        success: true,
        message: "Order received successfully",
        orderId: orderId
      };
    } catch (error) {
      console.error("Error processing order:", error);
      return {
        success: false,
        message: "Failed to process order",
      };
    }
  });
