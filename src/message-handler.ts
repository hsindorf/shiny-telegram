import twilio, { Twilio } from 'twilio';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

interface TwilioMessage {
  MediaContentType0?: string;
  MediaUrl0?: string;
  Body: string;
  From: string;
  To: string;
}

export class MessageReqHandler {
  constructor(private reqBody: TwilioMessage) {}
  public async handleRequest(): Promise<string> {
    if (
      this.reqBody.MediaContentType0 &&
      this.reqBody.MediaUrl0 &&
      this.validateImageType(this.reqBody.MediaContentType0)
    ) {
      try {
        const result = await this.sendImageResponse(this.reqBody.MediaUrl0);
        if (!result) throw Error();
      } catch (e) {
        return this.formatResponse('You sent an image, but there was trouble processing it!');
      }
      return this.formatResponse('Thanks for the image!');
    }
    return this.formatResponse('Please send an image!');
  }

  private formatResponse(body: string): string {
    const responseMessage = new twilio.twiml.MessagingResponse().message(body);
    return responseMessage.toString();
  }

  private async sendImageResponse(mediaUrl: string): Promise<boolean> {
    const client: Twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const messageOpts: MessageListInstanceCreateOptions = {
      to: this.reqBody.From,
      from: this.reqBody.To,
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
