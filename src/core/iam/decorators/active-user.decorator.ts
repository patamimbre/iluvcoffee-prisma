import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { ActiveUserData, FastifyRequestWithPayload } from "../iam.types";

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequestWithPayload>();
    const user = request.user as ActiveUserData;

    return field ? user[field] : user;
  },
);
