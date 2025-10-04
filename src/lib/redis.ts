import { createClient, RedisClientType } from "redis";

let redis: RedisClientType;

export async function initRedis(): Promise<RedisClientType> {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redis.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redis.on("connect", () => {
      console.log("Redis connected successfully");
    });

    await redis.connect();
  }

  return redis;
}

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redis) {
    return await initRedis();
  }
  return redis;
}

// Health check
export async function checkRedisConnection(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const result = await client.ping();
    return result === "PONG";
  } catch (error) {
    console.error("Redis connection failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.disconnect();
  }
}

export { redis };
