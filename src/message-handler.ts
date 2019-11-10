import twilio, { Twilio } from 'twilio';
import { MessageListInstanceCreateOptions, MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

interface TwilioMessage {
  MediaContentType0?: string;
  MediaUrl0?: string;
  Body: string;
  From: string;
  To: string;
}

enum ImageType {
  MEME = 'memes',
  ANIMAL = 'animals',
}

export class MessageReqHandler {
  constructor(private reqBody: TwilioMessage) {}
  public async handleRequest(): Promise<string> {
    let responseMessage: string;

    switch (this.reqBody.Body) {
      case ImageType.ANIMAL:
      case ImageType.MEME: {
        if (
          this.reqBody.MediaContentType0 &&
          this.reqBody.MediaUrl0 &&
          this.validateImageType(this.reqBody.MediaContentType0)
        ) {
          try {
            this.saveImage(this.reqBody.Body, this.reqBody.MediaUrl0);
          } catch (e) {
            console.error(`Error saving message: ${JSON.stringify(e)}`);
            responseMessage = 'I got your image, but there was trouble processing it!';
          }
          responseMessage = `Thanks for the image! Here's a new image for ${this.reqBody.Body}!`;
        } else {
          responseMessage = `Here's an image for ${this.reqBody.Body}!`;
        }

        try {
          const newImage = this.getNewImage(this.reqBody.Body);
          const result = await this.sendImageResponse(newImage);
          if (!result) throw Error('Unknown error sending image');
        } catch (e) {
          console.error(`Error sending message: ${JSON.stringify(e)}`);
          responseMessage = 'There was an issue getting you a picture, sorry!';
        }
        break;
      }
      default: {
        responseMessage =
          'Send a text with the body `memes` or `animals` to get a pic, w/ a pic to add to that category';
      }
    }

    return this.formatResponse(responseMessage);
  }

  private formatResponse(body: string): string {
    const responseMessage = new twilio.twiml.MessagingResponse().message(body);
    return responseMessage.toString();
  }

  private saveImage(category: string, imageUrl: string): void {
    // TODO: save image
    return;
  }

  private getNewImage(catgory: string): string {
    // TODO: get new image from db
    return 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png';
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
