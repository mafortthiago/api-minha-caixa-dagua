import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ReservatoriosService } from './reservatorios.service';
import { CreateReservatorioDto } from './dto/create-reservatorio.dto';
import { UpdateReservatorioDto } from './dto/update-reservatorio.dto';
import { MqttSubscriberService } from '../medicoes/mqtt-subscriber.service';

interface CalibracaoDto {
  value_cm?: number;
}

@Controller('reservatorios')
export class ReservatoriosController {
  constructor(
    private readonly reservatoriosService: ReservatoriosService,
    private readonly mqttService: MqttSubscriberService,
  ) {}

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

  @Post(':id/calibracao/cheio')
  @HttpCode(HttpStatus.ACCEPTED)
  async calibrarCheio(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CalibracaoDto = {},
  ) {
    return this.calibrar('set_full', id, body);
  }

  @Post(':id/calibracao/vazio')
  @HttpCode(HttpStatus.ACCEPTED)
  async calibrarVazio(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CalibracaoDto = {},
  ) {
    return this.calibrar('set_empty', id, body);
  }

  private async calibrar(
    cmd: 'set_full' | 'set_empty',
    id: number,
    body: CalibracaoDto,
  ) {
    await this.reservatoriosService.findOne(id);

    const extra: Record<string, unknown> = {};
    let valorSalvoNoBd: number | null = null;

    if (body.value_cm !== undefined) {
      if (typeof body.value_cm !== 'number' || body.value_cm <= 0) {
        throw new HttpException(
          'value_cm deve ser um número positivo',
          HttpStatus.BAD_REQUEST,
        );
      }
      extra.value_cm = body.value_cm;

      if (cmd === 'set_full') {
        await this.reservatoriosService.setDistanciaCheio(id, body.value_cm);
      } else {
        await this.reservatoriosService.setDistanciaVazio(id, body.value_cm);
      }
      valorSalvoNoBd = body.value_cm;
    }

    try {
      this.mqttService.publishCommand(cmd, extra);
    } catch (err) {
      throw new HttpException(
        (err as Error).message,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      cmd,
      status: 'enviado',
      reservatorio_id: id,
      value_cm: valorSalvoNoBd,
      persistido: valorSalvoNoBd !== null,
      observacao:
        valorSalvoNoBd === null
          ? 'Aguardando leitura do sensor; o valor será gravado quando o ACK chegar.'
          : 'Valor gravado no banco.',
    };
  }
}
