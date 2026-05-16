import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateReservatorioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome!: string;

  @IsInt()
  @Min(1)
  altura!: number;
}
