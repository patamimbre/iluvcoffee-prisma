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
import { Flavor } from "./entities/flavor.entity";

@Injectable()
export class CoffeesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll({ limit, offset }: PaginationQueryDto): Promise<Coffee[]> {
    return this.prisma.coffee.findMany({
      take: limit,
      skip: offset,
      include: { flavors: true },
    });
  }

  async findOne(id: number): Promise<Coffee> {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: { flavors: true },
    });
    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    try {
      const flavors =
        createCoffeeDto.flavors &&
        (await this.preloadFlavorsByName(createCoffeeDto.flavors));

      return await this.prisma.coffee.create({
        data: {
          ...createCoffeeDto,
          flavors: {
            connect: flavors?.map(({ id }) => ({ id })),
          },
        },
        include: { flavors: true },
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
      const flavors =
        updateCoffeeDto.flavors &&
        (await this.preloadFlavorsByName(updateCoffeeDto.flavors));

      return await this.prisma.coffee.update({
        where: { id },
        data: {
          ...updateCoffeeDto,
          flavors: {
            set: flavors?.map(({ id }) => ({ id })),
          },
        },
        include: { flavors: true },
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

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const flavor = await this.prisma.flavor.findUnique({
      where: { name },
    });
    if (flavor) return flavor;
    return await this.prisma.flavor.create({
      data: { name },
    });
  }

  private async preloadFlavorsByName(names: string[]): Promise<Flavor[]> {
    return Promise.all(names.map(name => this.preloadFlavorByName(name)));
  }
}
