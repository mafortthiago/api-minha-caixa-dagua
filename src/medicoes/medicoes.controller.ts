import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MedicoesService } from './medicoes.service';

@Controller('reservatorios/:reservatorioId/medicoes')
export class MedicoesController {
  constructor(private readonly medicoesService: MedicoesService) {}

  @Get()
  findAll(
    @Param('reservatorioId', ParseIntPipe) reservatorioId: number,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? Math.min(Math.max(Number(limit), 1), 500) : 50;
    return this.medicoesService.findByReservatorio(reservatorioId, take);
  }

  @Get('ultima')
  findUltima(@Param('reservatorioId', ParseIntPipe) reservatorioId: number) {
    return this.medicoesService.findUltima(reservatorioId);
  }
}
