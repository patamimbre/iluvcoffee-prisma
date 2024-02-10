import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import Redis from "ioredis";

import redisConfig from "../config/redis.config";

export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) {}

  private redisClient!: Redis;

  onApplicationBootstrap() {
    this.redisClient = new Redis({
      host: this.redisConfiguration.host!,
      port: this.redisConfiguration.port,
    });
  }
  onApplicationShutdown(_signal?: string | undefined) {
    return this.redisClient?.quit();
  }

  async insert(userId: number, tokenId: string): Promise<void> {
    await this.redisClient.set(this.getKey(userId), tokenId);
  }
  async validate(userId: number, tokenId: string): Promise<boolean> {
    const storedTokenId = await this.redisClient.get(this.getKey(userId));

    if (storedTokenId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }

    return tokenId === storedTokenId;
  }

  async invalidate(userId: number): Promise<void> {
    await this.redisClient.del(this.getKey(userId));
  }

  private getKey(userId: number): string {
    return `refresh-token-ids:${userId}`;
  }
}
