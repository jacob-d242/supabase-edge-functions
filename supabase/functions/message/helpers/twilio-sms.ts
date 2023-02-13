import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import { Sms } from "../types/sms.interface.ts";

export class TwilioSms {
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