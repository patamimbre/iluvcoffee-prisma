import { FastifyRequest } from "fastify";

import { REQUEST_USER_KEY } from "./iam.constants";

export type JwtPayload = {
  sub: number;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
};

export type FastifyRequestWithPayload = FastifyRequest & {
  [REQUEST_USER_KEY]?: JwtPayload;
};
