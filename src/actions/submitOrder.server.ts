import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const submitOrderFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fullname: z.string(),
      phone: z.string(),
      wilaya: z.string(),
      commune: z.string(),
      address: z.string().optional(),
      variantId: z.string().optional(),
      productPriceAmount: z.string().optional(),
      productName: z.string().optional(),
      variantTitle: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    console.log("Received new order:", data);

    try {
      // Create a unique order ID
      const orderId = `ORD-${Date.now()}`;
      const totalAmount = Number(data.productPriceAmount) + (data.wilaya ? 600 : 0); // Simplified shipping calculation fallback

      console.log(`Processing Order ${orderId}`);

      // 3. Send to Google Sheets (via Apps Script Webhook)
      const googleWebhookUrl = "https://script.google.com/macros/s/AKfycbz3wOIGXg0Ve21fh3XCOxnmWae5gsn7s-GPBCY0qNQWf19VnlgrIhbYjjwkr-rPtPTA/exec";
      
      if (googleWebhookUrl) {
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
              productPriceAmount: totalAmount,
              productName: data.productName || "",
              variantTitle: data.variantTitle || ""
            }),
          });
          
          if (!sheetResponse.ok) {
            console.warn("Failed to send order to Google Sheets:", await sheetResponse.text());
          } else {
            console.log("Successfully sent order to Google Sheets");
          }
        } catch (sheetError) {
          console.error("Error communicating with Google Sheets Webhook:", sheetError);
        }
      } else {
        console.warn("GOOGLE_SHEETS_WEBHOOK_URL is not set. Skipping Google Sheets integration.");
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
