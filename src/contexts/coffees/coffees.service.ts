import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PaginationQueryDto } from "@src/core/common/dto/pagination-query.dto";
import {
  isPrismaNotFoundError,
  isUniqueConstraintFailedError,
} from "@src/core/prisma/prisma.exceptions";
import { PrismaService } from "@src/core/prisma/prisma.service";

import { CreateCoffeeDto } from "./dto/create-coffee.dto";
import { UpdateCoffeeDto } from "./dto/update-coffee.dto";
import { Coffee } from "./entities/coffee.entity";

@Injectable()
export class CoffeesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll({ limit, offset }: PaginationQueryDto): Promise<Coffee[]> {
    return this.prisma.coffee.findMany({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: number): Promise<Coffee> {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
    });
    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    try {
      return await this.prisma.coffee.create({
        data: createCoffeeDto,
      });
    } catch (error) {
      if (isUniqueConstraintFailedError(error)) {
        throw new BadRequestException("Coffee name must be unique");
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateCoffeeDto: UpdateCoffeeDto,
  ): Promise<Coffee | null> {
    try {
      return await this.prisma.coffee.update({
        where: { id },
        data: updateCoffeeDto,
      });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Coffee #${id} not found`);
      }
      if (isUniqueConstraintFailedError(error)) {
        throw new BadRequestException("Coffee name must be unique");
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Coffee> {
    try {
      return await this.prisma.coffee.delete({
        where: { id },
      });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Coffee #${id} not found`);
      }
      throw error;
    }
  }
}
