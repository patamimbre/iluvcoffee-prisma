// https://docs.nestjs.com/techniques/configuration#configuration-namespaces

import { registerAs } from "@nestjs/config";

export default registerAs("redis", () => ({
  host: process.env.REDIS_HOST,
  port: Number.parseInt(process.env.REDIS_PORT || "6379"),
}));
