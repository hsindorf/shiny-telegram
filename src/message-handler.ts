import twilio, { Twilio } from 'twilio';
import { MessageListInstanceCreateOptions, MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { Client } from 'pg';

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
  dbClient: Client;
  constructor(private reqBody: TwilioMessage) {
    try {
      this.dbClient = new Client({
        connectionString: process.env.DATABASE_URL,
      });
    } catch (e) {
      throw Error('DB mistake'); // TODO: uncaught
    }
  }
  public async handleRequest(): Promise<string> {
    try {
      await this.dbClient.connect();
    } catch (e) {
      return this.formatResponse('Everything broke');
    }

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
          const newImage = await this.getNewImage(this.reqBody.Body);
          console.log('newimage: ' + newImage);
          if (!newImage) throw Error('No pictures available');
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

  private async saveImage(category: string, imageUrl: string): Promise<void> {
    try {
      const query = 'INSERT INTO images(imageurl, source, category) VALUES($1, $2, $3) ON CONFLICT DO NOTHING;';
      const values = [imageUrl, this.reqBody.From, category];
      await this.dbClient.query(query, values);
      return;
    } catch (e) {
      console.error(`Issue adding image to DB: ${JSON.stringify(e)}`);
      throw e;
    }
  }

  private async getNewImage(category: string): Promise<string | undefined> {
    const query = 'SELECT * FROM images WHERE category = $1 ORDER BY random() LIMIT 1;';
    const values = [category];
    const result = await this.dbClient.query(query, values);
    if (result.rows[0]) {
      return result.rows[0].imageurl;
    }
    return;
  }

  private async sendImageResponse(mediaUrl: string): Promise<MessageInstance | undefined> {
    let twilioClient: Twilio;
    try {
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (e) {
      console.error(`Error instantiating client: ${JSON.stringify(e)}`);
      throw e;
    }

    const messageOpts: MessageListInstanceCreateOptions = {
      to: this.reqBody.From,
      from: this.reqBody.To,
      mediaUrl,
    };

    const result = await twilioClient.messages.create(messageOpts);
    console.log(`Message result: ${JSON.stringify(result)}`);
    return result;
  }

  private validateImageType(mediaContentType: string): boolean {
    const imageRegex = /^image\/.+$/;
    return !!mediaContentType.match(imageRegex);
  }
}
