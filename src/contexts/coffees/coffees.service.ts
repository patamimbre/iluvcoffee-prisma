import { Injectable, NotFoundException } from "@nestjs/common";

import { isPrismaNotFoundError } from "@src/core/prisma/prisma.exceptions";
import { PrismaService } from "@src/core/prisma/prisma.service";

import { CreateCoffeeDto } from "./dto/create-coffee.dto";
import { UpdateCoffeeDto } from "./dto/update-coffee.dto";
import { Coffee } from "./entities/coffee.entity";

@Injectable()
export class CoffeesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Coffee[]> {
    return this.prisma.coffee.findMany();
  }

  async findOne(id: number): Promise<Coffee> {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
    });
    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);
    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    return this.prisma.coffee.create({
      data: createCoffeeDto,
    });
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
