import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservatoriosService } from './reservatorios.service';
import { CreateReservatorioDto } from './dto/create-reservatorio.dto';
import { UpdateReservatorioDto } from './dto/update-reservatorio.dto';

@Controller('reservatorios')
export class ReservatoriosController {
  constructor(private readonly reservatoriosService: ReservatoriosService) {}

  @Post()
  create(@Body() createReservatorioDto: CreateReservatorioDto) {
    return this.reservatoriosService.create(createReservatorioDto);
  }

  @Get()
  findAll() {
    return this.reservatoriosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservatoriosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservatorioDto: UpdateReservatorioDto,
  ) {
    return this.reservatoriosService.update(id, updateReservatorioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservatoriosService.remove(id);
  }
}
