import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

import { HashingService } from "./hashing.service";

@Injectable()
export class ArgonService implements HashingService {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async compare(
    password: string | Buffer,
    hashedPassword: string,
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, password);
  }
}
