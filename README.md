# How to use Redis with Express

## Building an App that can cache

Let's take a look at trying to build an app without Redis that caches response data. We can use a global variable. As soon as the process is terminated, the variable will be destroyed and as you see we no longer have a persistent cache as we used a variable, which is ephemeral.

## Redis to the rescue

![redis-logo-cropped.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1620163300620/RhY8enPo4.png)

Redis really becomes useful when you want to persist data in memory, for faster access that allows you to use it as a cache. So what does Redis do, Redis is an in-memory data store but a persistent on-disk database, meaning we can use Redis as a database that performs reads and writes directly into memory while also achieving persistence as the Redis server writes to disk from time to time.

## Let's get coding

For this tutorial, I have decided to go with a combination of express as a server and mongoose ODM with JavaScript.

To work with Redis inside of a node server, we need a Redis driver and we are going to use the official [Redis package](https://www.npmjs.com/package/redis).

Let's install the dependencies:

```bash
npm i express mongoose redis dotenv
npm i -D nodemon
```

Once we have the set up complete, we can go ahead and configure our `.env` file.

```bash
MONGODB_URI=<your mongodb connection string>
```

If you configured Redis locally, you can skip the REDIS\_\* variables, and just pass in the password.

If you used a docker container, spin it up with a port mapped to 6379 (or something else like 63791 here).

```bash
docker run --name some-redis -d -p 63791:6379 redis
```

if you used a Redislabs instance, log in and select your database and go to the configuration page, where you can find your connection env variables.

![Redis Labs config](https://cdn.hashnode.com/res/hashnode/image/upload/v1620251015217/pJP2t2wOT.png)

`.env`

```bash
REDIS_HOST=<your Redis HOST>
REDIS_PORT=<your Redis PORT>
REDIS_PASSWORD=<your config PASSWORD>
```

We are completely configured to use Redis in our app. To keep this article short I'm gonna skip over setting up mongoose and express, as this is a more generalised approach towards using Redis in any of your node apps.
(You can find the code for models, controllers, etc on the [GitHub repository](https://github.com/cryptus-neoxys/node-redis-tutorial))

Let's set up the Redis Client in our `index.js`, add the following lines to your code.

`index.js`

```javascript
import redis from "redis";
import { promisify } from "util";

// create redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

// redis.js doesn't support async utils as of writing this article
// we can use the recommended workaround
export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);
```

We will use getAsync to get the values from Redis store and setAsync to set values in our Redis store.

We need to modify our APIs to use Cache when we request data, via Get requests.

`Express GET route`

```javascript
app.get("/api/<resource>", async (req, res) => {
  try {
    // Get from cache using the "Key"
    const getRes = await getAsync("resourceKey" );
    if (getRes)
      return res.json({ success: true, data: JSON.parse(getRes) });

    // On cache-miss => query database
    const users = await <Model>.find({});

    // Set cache
    await setAsync("resourceKey",   // Key
      JSON.stringify({res}),        // Value
      "EX",                         // Set explicit expiry
      60                            // TTL in seconds
    );

    return res.status(200).json({success: true, data: <resource>});
  } catch (error) {
    // Handle errors
  }
});
```

Add the Cache _getAsync_ and _setAsync_ to all your GET routes and that's it. Now you have a basic cache setup with your express server.

🎉🎉🎉 Super fast and efficient caching.

![DB vs Cache](https://cdn.hashnode.com/res/hashnode/image/upload/v1620468674324/d_bDigvMs.png)

This blog is part of a [Redis](https://blog.devsharma.live/series/caching-with-redis) learning series, in the [previous post](https://blog.devsharma.live/how-to-install-and-set-up-redis), I have explained setting up Redis using 3 different ways.

Feel free to reach out to me on Twitter [@cryptus_neoxys](https://twitter.com/cryptus_neoxys) and connect with me on [LinkedIn](https://www.linkedin.com/in/cryptus-neoxys/).

### Refs

[NPM Redis.js](https://www.npmjs.com/package/redis)

[yoursTRULY YouTube](https://youtu.be/RL9mnX0qXhY)

[Traversy Media](https://youtu.be/oaJq1mQ3dFI)
