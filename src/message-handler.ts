import twilio, { Twilio } from 'twilio';
import { MessageListInstanceCreateOptions, MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

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
        console.error(JSON.stringify(e));
        return this.formatResponse('I got your image, but there was trouble processing it!');
      }
      return this.formatResponse('Thanks for the image!');
    }
    return this.formatResponse('Please send an image!');
  }

  private formatResponse(body: string): string {
    const responseMessage = new twilio.twiml.MessagingResponse().message(body);
    return responseMessage.toString();
  }

  private async sendImageResponse(mediaUrl: string): Promise<MessageInstance> {
    const client: Twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const messageOpts: MessageListInstanceCreateOptions = {
      to: this.reqBody.From,
      from: this.reqBody.To,
      mediaUrl,
    };

    return await client.messages.create(messageOpts);
  }

  private validateImageType(mediaContentType: string): boolean {
    const imageRegex = /^image\/.+$/;
    return !!mediaContentType.match(imageRegex);
  }
}
