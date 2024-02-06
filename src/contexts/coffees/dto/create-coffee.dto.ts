import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCoffeeDto {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsNotEmpty()
  @IsString()
  readonly brand!: string;

  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  readonly flavors?: string[];
}
