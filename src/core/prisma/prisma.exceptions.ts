import { Prisma } from "@prisma/client";

type PrismaError = Prisma.PrismaClientKnownRequestError;

enum PrismaErrorCode {
  RecordDoesNotExist = "P2025",
  UniqueConstraintFailed = "P2002",
}

const isPrismaError = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError;

export const isPrismaNotFoundError = (e: unknown) =>
  isPrismaError(e) &&
  (e as PrismaError).code === PrismaErrorCode.RecordDoesNotExist.toString();

export const isUniqueConstraintFailedError = (e: unknown) =>
  isPrismaError(e) &&
  (e as PrismaError).code === PrismaErrorCode.UniqueConstraintFailed.toString();
