"use strict";

var log4js = require("log4js");
var config = require("./lib/config");
var redis = require("redis");

var logger = log4js.getLogger("main");
logger.setLevel(config("LOG_LEVEL"));

var redis = require("redis");
var client = redis.createClient(config("REDIS_URL"), {
  retry_strategy: function (options) {
    if (options.error.code === "ECONNREFUSED") {
      return new Error("REDIS instance refused connection: ECONNREFUSED");
    }
    if (options.total_retry_time > 1000 * 60) {
      return new Error("REDIS retry time exhausted");
    }
    if (options.times_connected > 10) {
      return new Error("REDIS max reconnection exhausted");
    }

    return 5000; // retry after 5 seconds
  }
});

client.on("connect", function() {
  logger.debug("Connected to the REDIS instance");
});

client.on("ready", function() {
  logger.debug("REDIS instance is accepting commands");
});

client.on("reconnecting", function(evt) {
  logger.debug("Connection to REDIS was lost: reconnecting:", evt.delay, evt.attempt);
});

client.on("error", function (err) {
  logger.error("REDIS error captured on the error listener", err);
});

client.on("end", function () {
  logger.debug("Connection to REDIS has been closed");
});

/* storing a simple string */
client.set("framework", "Spring", function (err, result) {
  if (err) {
    logger.error("Error found while saving key-value pair in Redis");
  }
  logger.debug("Key-value pair successfully saved:", result);
});

client.set(["key", "value"], function (err, result) {
  if (err) {
    logger.error("Error found while saving key-value pair in Redis as an array");
  }
  logger.debug("Key-value pair successfully saved as an array:", result);
});

/* retrieving a value stored in Redis by its key */
client.get("framework", function (err, result) {
  if (err) {
    logger.error("Could not retrieve key `framework`", err);
  }
  console.log("Successully retrieved key associated to `framework`:", result);
});

client.get("key", function (err, result) {
  if (err) {
    logger.error("Could not retrieve key `key`", err);
  }
  console.log("Successully retrieved key associated to `key`:", result);
});

/* You can store hashes (objects) as values in redis using hmset */
client.hmset("tech-stack", {
  backend: "Spring",
  frontend: "AngularJS",
  database: "Postgres",
  cache: "Redis"
}, function (err) {
  if (err) {
    logger.err("Error storing hash in Redis", err);
  }
  logger.debug("Successfully saved hash in Redis");
});

/* when storing objects, you should use hgetall instead of get */
client.hgetall("tech-stack", function (err, result) {
  if (err) {
    logger.error("Could not retrieve value associated to `tech-stack` from Redis:", err);
  }
  logger.debug("tech-stack =>", result);
});

/*
  Note that Redis does not natively support nested objects!!!
  (framework coerces those into strings before being stored)
*/

var code = {
  id: 555,
  message: "Nested objects are not be supported"
};

client.hmset("event", {
  type: "Error",
  description: "Error while storing in Redis",
  code: code
}, function (err) {
  if (err) {
    logger.err("Error storing nested object in Redis:", err);
  }
  logger.debug("Successfully saved nested object hash in Redis");
});

client.hgetall("event", function (err, result) {
  if (err) {
    logger.error("Could not retrieve `event` from Redis:", err);
  }
  logger.debug("nested object from Redis:", JSON.stringify(result));
});


/* Redis allows you to store a list of items */
client.rpush(["friends", "monica", "rachel", "phoebe"], function (err) {
  if (err) {
    logger.error("Error storing list in Redis:", err);
  }
});

client.lrange("friends", 0, -1, function (err, result) {
  if (err) {
    logger.error("Could not retrieve list from Redis:", err);
  }
  logger.debug("friends =>", result);
});

/* you can also insert from the beginning with lpush */
client.lpush(["friends", "joey", "ross", "chandler"], function (err) {
  if (err) {
    logger.error("Error storing list in Redis:", err);
  }
});

client.lrange("friends", 0, -1, function (err, result) {
  if (err) {
    logger.error("Could not retrieve list from Redis:", err);
  }
  logger.debug("friends =>", result);
});

/* Redis also allows you to store sets that don't allow duplicates */
client.sadd(["cast", "peter", "saul", "carrie", "peter"], function (err) {
  if (err) {
    logger.error("Could not store set in Redis:", err);
  }
});

client.smembers("cast", function (err, result) {
  if (err) {
    logger.error("Could not retrieve set from Redis:", err);
  }
  logger.debug("cast =>", result);
});

/* Redis returns an empty result when there is no key*/
client.get("non-existent", function (err, result) {
  if (err) {
    logger.error("Error getting non-existent key:", err);
  }
  if (!result) {
    logger.debug("The key `non-existent` was not found in the store");
  } else {
    logger.debug("non-existent =>", result);
  }
});


/* Deleting Keys */
client.del("cast", function (err) {
  if (err) {
    logger.error("Could not delete entry from Redis:", err);
  }
  logger.debug("cast was successfully removed from Redis");
});

client.del("friends", function (err) {
  if (err) {
    logger.error("Could not delete entry from Redis:", err);
  }
  logger.debug("friends was successfully removed from Redis");
});

/* Set expiration time on keys */
client.set("hello", "world");
client.expire("hello", 10);

var handler = setInterval(function () {
  client.get("hello", function (err, result) {
    if (err) {
      logger.error("Could not read from Redis:", err);
    }
    if (result) {
      logger.debug("hello =>", result);
    } else {
      clearInterval(handler);
      logger.debug("hello key no longer in Redis");
    }
  });
}, 1000);

/* Incrementing and Decrementing */
client.set("counter", 0, function (err) {
  if (err) {
    logger.error("Could not define counter:", err);
  }
});

client.incr("counter", function (err, result) {
  if (err) {
    logger.error("Could not increment counter:", err);
  }
  logger.debug("counter =>", result);
});


client.get("counter", function (err, result) {
  if (err) {
    logger.error("Error reading counter:", err);
  }
  logger.debug("counter =>", result);
});

client.incrby("counter", 5, function (err, result) {
  if (err) {
    logger.error("Could not increment counter by 5:", err);
  }
  logger.debug("counter =>", result);
});


/* hkeys, which by the way is not in the documentation */
client.hset("hash key", "hashvalue1", "hasprop1", function (err) {
  if (err) {
    logger.err("Could not store hashkey", err);
  }
});

client.hset("hash key", "hashvalue2", "hasprop2", function (err) {
  if (err) {
    logger.err("Could not store hashkey", err);
  }
});

client.hget("hash key", "hashvalue1", function (err, result) {
  if (err) {
    logger.error("Could not read from REDIS", err);
  }
  logger.debug("hash key:", result);
});

client.hget("hash key", "hashvalue2", function (err, result) {
  if (err) {
    logger.error("Could not read from REDIS", err);
  }
  logger.debug("hash key:", result);
});

client.hkeys("hash key", function (err, results) {
  if (err) {
    logger.error("Error using hkeys:", err);
  }
  logger.debug("results:", results);
});

/* cleaning up all the mess */
var keys = ["framework", "key", "tech-stack", "event", "friends", "cast", "non-existent", "hello", "counter", "hash key"];

setTimeout(function () {
  keys.forEach(function (key, i) {
    client.del(key, function (err) {
      if (err) {
        logger.error("Could not delete " + key + "; error=", err);
      }
      if (i === keys.length - 1 ) {
        client.quit();
      }
    });
    logger.debug("Keys being deleted:", keys);
  });
}, 12500);
