import { getRedisClient } from "./redis";

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

const DEFAULT_TTL = 3600; // 1 hour
const DEFAULT_PREFIX = "cache";

export class Cache {
  private prefix: string;

  constructor(prefix: string = DEFAULT_PREFIX) {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  // Get value from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await getRedisClient();
      const value = await redis.get(this.getKey(key));

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  // Set value in cache
  async set(
    key: string,
    value: any,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const redis = await getRedisClient();
      const ttl = options.ttl || DEFAULT_TTL;
      const serializedValue = JSON.stringify(value);

      await redis.setEx(this.getKey(key), ttl, serializedValue);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  // Delete from cache
  async del(key: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.del(this.getKey(key));
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  // Delete multiple keys
  async delMany(keys: string[]): Promise<void> {
    try {
      const redis = await getRedisClient();
      const prefixedKeys = keys.map((key) => this.getKey(key));
      await redis.del(prefixedKeys);
    } catch (error) {
      console.error("Cache delete many error:", error);
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const redis = await getRedisClient();
      const result = await redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  // Get or set pattern (cache-aside)
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Store in cache
    await this.set(key, fresh, options);

    return fresh;
  }

  // Increment counter
  async increment(key: string, ttl: number = DEFAULT_TTL): Promise<number> {
    try {
      const redis = await getRedisClient();
      const result = await redis.incr(this.getKey(key));

      // Set TTL on first increment
      if (result === 1) {
        await redis.expire(this.getKey(key), ttl);
      }

      return result;
    } catch (error) {
      console.error("Cache increment error:", error);
      return 0;
    }
  }

  // Flush all keys with this prefix
  async flush(): Promise<void> {
    try {
      const redis = await getRedisClient();
      const keys = await redis.keys(`${this.prefix}:*`);

      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error("Cache flush error:", error);
    }
  }
}

// Predefined cache instances
export const userCache = new Cache("user");
export const expenseCache = new Cache("expense");
export const companyCache = new Cache("company");
export const reportCache = new Cache("report");

// Cache keys helpers
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  company: (id: string) => `company:${id}`,
  expense: (id: string) => `expense:${id}`,
  userExpenses: (userId: string, page: number) =>
    `user:${userId}:expenses:${page}`,
  approvals: (userId: string) => `approvals:${userId}`,
  categories: (companyId: string) => `categories:${companyId}`,
  dashboardSummary: (userId: string, period: string) =>
    `dashboard:${userId}:${period}`,
  expenseReport: (companyId: string, startDate: string, endDate: string) =>
    `report:${companyId}:${startDate}:${endDate}`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 1 day
};
