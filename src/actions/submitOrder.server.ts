import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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

      // 1. Stock Deduction Logic
      let productsData: any[] = [];
      const productsFilePath = path.join(process.cwd(), "public", "data", "products.json");
      let stockDeducted = false;
      let targetProductIndex = -1;
      let targetVariantIndex = -1;

      try {
        const fileContent = fs.readFileSync(productsFilePath, "utf-8");
        productsData = JSON.parse(fileContent);

        if (data.productName && data.variantTitle) {
          targetProductIndex = productsData.findIndex((p: any) => p.node.title === data.productName);
          if (targetProductIndex !== -1) {
            const product = productsData[targetProductIndex];
            targetVariantIndex = product.node.variants.edges.findIndex((v: any) => v.node.title === data.variantTitle);
            
            if (targetVariantIndex !== -1) {
              const variant = product.node.variants.edges[targetVariantIndex].node;
              if (variant.quantityAvailable !== undefined) {
                if (variant.quantityAvailable <= 0) {
                  return { success: false, message: "هذا المقاس غير متوفر حاليًا" };
                }
                // Deduct stock in memory
                variant.quantityAvailable -= 1;
                if (variant.quantityAvailable === 0) {
                  variant.availableForSale = false;
                }
                
                // Synchronously write back to prevent double orders
                fs.writeFileSync(productsFilePath, JSON.stringify(productsData, null, 2), "utf-8");
                stockDeducted = true;
                console.log(`[Stock] Deducted 1 from ${data.productName} size ${data.variantTitle}. Remaining: ${variant.quantityAvailable}`);
              }
            }
          }
        }
      } catch (e) {
        console.error("Error reading/updating stock:", e);
      }

      // 2. Insert into Supabase
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
        
        // Rollback stock if Supabase failed
        if (stockDeducted) {
          try {
            const fileContent = fs.readFileSync(productsFilePath, "utf-8");
            const currentData = JSON.parse(fileContent);
            const variant = currentData[targetProductIndex].node.variants.edges[targetVariantIndex].node;
            variant.quantityAvailable += 1;
            if (variant.quantityAvailable > 0) {
              variant.availableForSale = true;
            }
            fs.writeFileSync(productsFilePath, JSON.stringify(currentData, null, 2), "utf-8");
            console.log(`[Stock] Rolled back stock for ${data.productName} size ${data.variantTitle}`);
          } catch (e) {
            console.error("Failed to rollback stock:", e);
          }
        }
        
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
          
          console.log(`\n[Meta CAPI] Response Status: ${capiResponse.status}`);
          const responseBody = await capiResponse.text();
          
          try {
            const parsedBody = JSON.parse(responseBody);
            console.log(`\n[Meta CAPI] Response Body:\n${JSON.stringify(parsedBody, null, 2)}\n`);
          } catch (e) {
            console.log(`\n[Meta CAPI] Response Body:\n${responseBody}\n`);
          }
          
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
