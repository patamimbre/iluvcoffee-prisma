import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class HashingService {
  abstract hash(password: string): Promise<string>;
  abstract compare(
    password: string | Buffer,
    hashedPassword: string,
  ): Promise<boolean>;
}
