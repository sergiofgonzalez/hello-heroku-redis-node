# Hello, Redis!
> basic illustration of Redis functionality using Node.js and targetting Heroku PaaS

The example is based on the `redis-node` documentation and the article `https://www.sitepoint.com/using-redis-node-js/`.

# Description
In the example application we follow a simple approach of connecting and checking Redis functionality in sequence:
+ Setting up a connection to a Redis instance hosted in Heroku &mdash; a simple retry strategy is configured.
+ Setting up handlers for most relevant events Redis emits: `connect`, `ready`, `reconnecting`, `error` and `end`.
+ Storing and retrieving simple key-value pairs, in which the value is a string: `set` and `get.`
+ Storing and retrieving objects (*hashes* in Redis parlance): `hmset` and `hgetall`. It is also demonstrated that Redis does not support storing JavaScript objects with nested objects.
+ Storing and retrieving list of items: `rpush`, `lpush`, `lrange`.
+ Storing and retrieving sets of items: `sadd`, `smembers`.
+ Incrementing and Decrementing counters: `incr` and `incrby`.
+ Deleting keys
+ Expiration of keys
+ Getting the keys of registered values: `hkeys`
