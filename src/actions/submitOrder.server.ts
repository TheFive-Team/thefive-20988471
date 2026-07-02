import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

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
      const orderId = `ORD-${Date.now()}`;
      
      const productFee = Number(data.productPriceAmount) || 0;
      // Note: Typically you'd calculate exact delivery fee based on wilaya, using 600 DZD as default fallback
      const deliveryFee = data.wilaya ? 600 : 0; 
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
        delivery_type: "توصيل للمنزل",
        delivery_fee: deliveryFee,
        status: "pending"
      });

      if (error) {
        console.error("Supabase insert error:", error);
        return { success: false, message: "Failed to save order to database." };
      }

      console.log(`Successfully saved order ${orderId} to Supabase`);

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
