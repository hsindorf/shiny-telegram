import twilio, { Twilio } from 'twilio';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

interface TwilioMessage {
  MediaContentType0?: string;
  MediaUrl0?: string;
  Body: string;
  From: string;
}

export class MessageReqHandler {
  constructor(private reqBody: TwilioMessage) {}
  public async handleRequest(): Promise<string> {
    if (
      this.reqBody.MediaContentType0 &&
      this.reqBody.MediaUrl0 &&
      this.validateImageType(this.reqBody.MediaContentType0) &&
      (await this.sendImageResponse(this.reqBody.MediaUrl0))
    ) {
      return this.formatResponse('Thanks for the image!');
    }
    return this.formatResponse('Please send an image!');
  }

  public formatResponse(body: string): string {
    const responseMessage = new twilio.twiml.MessagingResponse().message(body);
    return responseMessage.toString();
  }

  public async sendImageResponse(mediaUrl: string): Promise<boolean> {
    const client: Twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const messageOpts: MessageListInstanceCreateOptions = {
      to: this.reqBody.From,
      mediaUrl,
    };

    try {
      await client.messages.create(messageOpts);
      return true;
    } catch (e) {
      return false;
    }
  }

  private validateImageType(mediaContentType: string): boolean {
    const imageRegex = /^image\/.+$/;
    return !!mediaContentType.match(imageRegex);
  }
}
