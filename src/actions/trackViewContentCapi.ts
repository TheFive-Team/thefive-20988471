import { createServerFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

export const trackViewContentCapiFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      productName: z.string(),
      productId: z.string(),
      price: z.number(),
      currency: z.string().optional(),
      eventId: z.string(),
      clientUserAgent: z.string().optional(),
      eventSourceUrl: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    console.log("Received ViewContent CAPI event:", data);

    try {
      const pixelId = process.env.VITE_META_PIXEL_ID || process.env.META_PIXEL_ID;
      const accessToken = process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN;
      
      if (!pixelId || !accessToken) {
        console.log(`[Meta CAPI - ViewContent] skipped: missing pixelId=${!pixelId}, accessToken=${!accessToken}`);
        return { success: false, message: "Missing CAPI credentials" };
      }

      const clientUserAgent = data.clientUserAgent || '';
      const eventSourceUrl = data.eventSourceUrl || '';
      const metaCurrency = data.currency || "DZD";
      const metaValue = Number(data.price);

      let clientIpAddress = '';
      let fbp = '';
      let fbc = '';

      try {
        const directIp = getRequestIP();
        const cfIp = getRequestHeader('cf-connecting-ip');
        const xForwarded = getRequestHeader('x-forwarded-for');
        
        clientIpAddress = directIp || cfIp || (xForwarded ? xForwarded.split(',')[0].trim() : '') || '';
        
        fbp = getCookie('_fbp') || '';
        fbc = getCookie('_fbc') || '';
      } catch (e) {
        console.warn("[Meta CAPI - ViewContent] Could not extract headers/cookies:", e);
      }

      const userData: any = {
        client_user_agent: clientUserAgent,
      };

      if (clientIpAddress) userData.client_ip_address = clientIpAddress;
      if (fbp) userData.fbp = fbp;
      if (fbc) userData.fbc = fbc;

      const payload = {
        data: [{
          event_name: 'ViewContent',
          event_time: Math.floor(Date.now() / 1000),
          event_id: data.eventId,
          action_source: 'website',
          event_source_url: eventSourceUrl,
          user_data: userData,
          custom_data: {
            currency: metaCurrency,
            value: metaValue,
            content_name: data.productName,
            content_ids: [data.productId],
            content_type: 'product',
            contents: [{
              id: data.productId,
              quantity: 1
            }]
          }
        }]
      };

      const graphApiEndpoint = `https://graph.facebook.com/v20.0/${pixelId}/events`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const capiResponse = await fetch(`${graphApiEndpoint}?access_token=${accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        const responseBody = await capiResponse.text();
        
        if (!capiResponse.ok) {
          console.error('[Meta CAPI - ViewContent] Error:', responseBody);
          return { success: false, message: "Failed to send event to Meta CAPI" };
        } else {
          console.log('✅ Successfully sent ViewContent event to Meta CAPI');
          return { success: true };
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('[Meta CAPI - ViewContent] Exception:', error);
      return { success: false, message: "Internal Server Error" };
    }
  });
