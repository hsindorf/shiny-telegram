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
        if (!result) throw Error('Unknown error sending image');
      } catch (e) {
        console.error(`Error sending message: ${JSON.stringify(e)}`);
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

  private async sendImageResponse(mediaUrl: string): Promise<MessageInstance | undefined> {
    let client: Twilio;
    try {
      client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (e) {
      console.error(`Error instantiating client: ${JSON.stringify(e)}`);
      throw e;
    }
    const messageOpts: MessageListInstanceCreateOptions = {
      to: this.reqBody.From,
      from: this.reqBody.To,
      mediaUrl,
    };

    const result = await client.messages.create(messageOpts);
    console.log(`Message result: ${JSON.stringify(result)}`);
    return result;
  }

  private validateImageType(mediaContentType: string): boolean {
    const imageRegex = /^image\/.+$/;
    return !!mediaContentType.match(imageRegex);
  }
}
