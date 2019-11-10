import express = require('express');
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const PORT = process.env.PORT;
const app: express.Application = express();

app.get('/', (req, res) => {
  console.log(req);
  res.send('Hello world');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
