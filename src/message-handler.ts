import twilio from 'twilio';

export class MessageReqHandler {
  constructor(private reqBody: { [key: string]: string }) {} // TODO: actual type
  public handleRequest(): string {
    return this.formatResponse([`Hello, ${JSON.stringify(this.reqBody)}`]);
  }

  public formatResponse(messages: string[]): string {
    const response = new twilio.twiml.MessagingResponse();
    messages.forEach((message: string, i: number) => {
      const resMessage = `Message ${i} of ${messages.length}: ${message}`;
      response.message(resMessage);
    });
    return response.toString();
  }
}
