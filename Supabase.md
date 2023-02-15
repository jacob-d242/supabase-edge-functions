# Supabase edge functions

## A guide to create and deploy edge functions in supabase

Serverless computing has been growing in the recent past. It promises a more cost-effective way to build and run applications that scale elastically.
Supabase is a serverless cloud platform allowing developers to build web and mobile applications without servers. with edge functions as an easy way to add serverless functions to applications. 
But how do you write Edge functions? how do you write serverless code? and, how do you deploy edge functions? In this article, we’ll learn all of that and more


## What are Supabase edge functions?

Supabse edge functions are executed in **Deno a** JavaScript runtime.
Edge functions allow you to serve content from a CDN server closest to your user. Developers can use edge functions to modify a network request at the edge so it's closer to your visitors around the globe without the need for manual involvement possible using Deno Deploy hosted services. Supabase handles the underlying technologies as you focus on developing application logic.
Supabase Edge function receives the incoming request at the Relay, The Relay acts as a gateway for API requests and authenticates the JWT to the headers, and also provides logging and rate limiting.
The Realy retrieves information about the function along with the deployment ID and passes it over to the Deno deployment platform on receipt of a function request. Deno then executes the function code and passes a back response to the relay which is received by the end user.
**Getting started** 
to get started with supabase edge functions, you’ll need the following installed.

- Install the Supabase CLI : 
    npm install -g supabase --save-dev
- Log in to the CLI using the command :
    npx supabse login
- Initialize a project :
    npx supabse login
- link your local project to the remote Supabase project : (here is a tutorial on how to create a remote supabase project)
    supabase link --project-ref <your-project-ref>


    *-Requirements*

**Real-world scenario chat app with Twilio**

**Your first edge functions**
The edge function in supabase enables you to build complex applications, connect to databases, and process data in real time.
We will create a message Edge function that will send SMS using Twilio a messaging API.
To create edge functions with supabase run the below command, where the *message* is the functions name.

    supabase functions new message

This creates a boilerplate of code inside your Supabase folder :

    /functions/message/index.ts

Create a .env file at the root of the project and add the following values to your file

    TWILIO_ACCOUNT_SID='Account SID'
    TWILIO_AUTH_TOKEN='Auth Token'
    TWILIO_PHONE_NUMBER='My Twilio phone number'

Define your interface to represent the message payload

    export interface  Sms{
        [index: string ] : string;
        From : string;
        To : string;
        Body : string;
    }
Next we create a helper class to send SMS .The class constructor will take the account SSID and Auth Token which are encoded together and passed as aouthorization header in the Api Request.
    
    ../message/helper/Twilio-Message.ts

    import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
    import { Sms } from "../types/sms.interface.ts";

        export class TwilioMessage {
        private authorizationHeader: string;

        constructor(private accountSID: string, authToken: string) {
            this.authorizationHeader =
            "Basic " +
            base64.fromUint8Array(
                new TextEncoder().encode(accountSID + ":" + authToken)
            );
        }

        async sendSms(payload: Sms): Promise<any> {
            const res = await fetch(
            "https://api.twilio.com/2010-04-01/Accounts/" +
                this.accountSID +
                "/Messages.json",
            {
                method: "POST",
                headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                Authorization: this.authorizationHeader,
                },
                body: new URLSearchParams(payload).toString(),
            }
            );
            const data = await res.json();
            return data;
        }
        }
Next create a send message and use the sendsms()  method to send the message to the specified number in the request body respectively. add the following code to your index.ts

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

    console.log({ message });

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



**Deploy edge functions with supabase**

To deploy your message edge functions run the following command
    
        supabase deploy functions message
The functions packages your function code ,deploys it ot a remote supabase Project . In your  supabase Dashboard ,

        dashboard image missing

 below invoke click on the URL . Copy paste the curl request o test your functions fro the terminal as below 

    
      curl -L -X POST 'https://rmaqhwfotslevjnyljav.functions.
      supabase.co/message' -H 'Authorization: Bearer 
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
      eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYXFod2ZvdHNsZXZqbnlsamF2I
      iwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM4NjAxMjQsImV4cCI6MTk4OTQzNj
      EyNH0.OPOsWcopMmR5qy_WyeAZJBJlEOZCKfLZKTp2ykbkoYU' --data '
      {"name":"Functions"}'

**Run locally**

To run supabase Edge function locally you need to have Subabase studion installed locally. Checkout the official docs on how to get started here.

start your Supabase project run 

    supabase start

next you need to start the message function

    npx supabase functions serve message 

This command will start a local server listening on port 54321 for the message function. 
make a curl request from your  command line  to invoke your function.
    curl --request POST 'http://localhost:54321/functions/v1/message' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
  --header 'Content-Type: application/json' \
  --data '{ "textMessage":"Moracha" ,"toMobile":"+25412345678"}'

The Bearer token  in the header for authentication can be your project’s ANON key, the SERVICE_ROLE key, or a user’s JWT token

**Deploy to Vercel with GitHub ci/cd**

**Conclusion**

