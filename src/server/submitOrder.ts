import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const submitOrderFn = createServerFn("POST")
  .validator(
    z.object({
      fullname: z.string(),
      phone: z.string(),
      wilaya: z.string(),
      commune: z.string(),
      address: z.string().optional(),
      variantId: z.string().optional(),
      productPriceAmount: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    console.log("Received new order:", data);

    try {
      // 1. TODO: Fetch actual product price from Shopify/Database using variantId
      // to avoid trusting the client's productPriceAmount.
      
      // 2. TODO: Send to ZR Express API
      // We need the exact API endpoint. Example:
      // const zrResponse = await fetch("https://api.zrexpress.app/v1/orders", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${process.env.ZR_EXPRESS_SECRET_KEY}`,
      //     "Tenant-Id": process.env.ZR_EXPRESS_TENANT_ID || ""
      //   },
      //   body: JSON.stringify({
      //     recipientName: data.fullname,
      //     recipientPhone: data.phone,
      //     wilaya: data.wilaya,
      //     commune: data.commune,
      //     address: data.address,
      //     codAmount: data.productPriceAmount // + shipping
      //   })
      // });
      
      // 3. TODO: Send to Google Sheets
      // Requires Google Service Account JWT auth and Google Sheets API.
      // We will implement this once credentials are provided.

      // Simulate network delay for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: true,
        message: "Order received successfully",
        orderId: `ORD-${Date.now()}`
      };
    } catch (error) {
      console.error("Error processing order:", error);
      return {
        success: false,
        message: "Failed to process order",
      };
    }
  });
