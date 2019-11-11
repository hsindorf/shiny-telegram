# shiny-telegram
playing with twilio + a few beers one night lol

`{{baseUrl}}/message` receives a twilio message webhook. it's deployed on heroku

## Using locally

1. Install dependencies
```
$ npm install
```

2. To run without transpiling
```
$ npm run dev
```

2. To transpile and run
```
$ npm run prod
```

3. Send `x-www-form-urlencoded` requests to the `/messages` endpoint with the format of twilio message webhook (below only has properties looked @ by the app):

```
MediaContentType0?: image/*
MediaUrl0?: some url
Body: animals | memes
From: +1nnnnnnnnnn
To: +1nnnnnnnnnn
```

## Using it w/ twilio

1. Set up your twilio number to send message webhooks to the `/messages` endpoint
2. Text the twilio number:
  - `memes` - no image - to get a memes image
  - `memes` - with an image - add to memes and get a memes image back
  - `animals` - ... etc.
