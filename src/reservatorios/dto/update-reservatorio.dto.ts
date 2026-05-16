import { PartialType } from '@nestjs/mapped-types';
import { CreateReservatorioDto } from './create-reservatorio.dto';

export class UpdateReservatorioDto extends PartialType(CreateReservatorioDto) {}
