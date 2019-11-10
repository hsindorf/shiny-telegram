import express from 'express';
import * as dotenv from 'dotenv';
import { MessageReqHandler } from './message-handler';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const PORT = process.env.PORT;
const app: express.Application = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log(req);
  res.send('Hello world');
});

app.post('/message', (req, res) => {
  const messageHandler = new MessageReqHandler(req.body);
  res.send(messageHandler.handleRequest());
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
