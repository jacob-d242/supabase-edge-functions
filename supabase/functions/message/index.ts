import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

import { TwilioSms } from "./helpers/twilio-sms.ts";

const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
const authToken = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
const fromMobile = Deno.env.get("TWILIO_PHONE_NUMBER") || "";

serve(async (req) => {
  const { textMessage, toMobile } = await req.json();
  const twilioClient = new TwilioSms(accountSid, authToken);
  const message = await twilioClient.sendSms({
    Body: textMessage,
    From: fromMobile,
    To: toMobile,
  });
  const data = {
    isSuccess: false,
  };

  if (message.status === "queued") {
    data.isSuccess = true;
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});