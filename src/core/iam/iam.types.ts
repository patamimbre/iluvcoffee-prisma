import { FastifyRequest } from "fastify";

import { REQUEST_USER_KEY } from "./iam.constants";

export type ActiveUserData = {
  sub: number;
  email: string;
};

export type TokenResponse = { accessToken: string; refreshToken: string };

export type FastifyRequestWithPayload = FastifyRequest & {
  [REQUEST_USER_KEY]?: ActiveUserData;
};
