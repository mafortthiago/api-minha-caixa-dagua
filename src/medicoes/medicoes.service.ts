import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservatorio } from '../reservatorios/entities/reservatorio.entity';
import { Medicao } from './entities/medicao.entity';

export interface MedicaoPayload {
  distance_cm: number;
  level_pct: number;
  is_calibrated: boolean;
  rssi?: number;
  uptime_s?: number;
}

@Injectable()
export class MedicoesService {
  private readonly logger = new Logger(MedicoesService.name);

  constructor(
    @InjectRepository(Medicao)
    private readonly medicaoRepository: Repository<Medicao>,
    @InjectRepository(Reservatorio)
    private readonly reservatorioRepository: Repository<Reservatorio>,
  ) {}

  async registrar(reservatorioId: number, payload: MedicaoPayload) {
    const reservatorio = await this.reservatorioRepository.findOneBy({
      id: reservatorioId,
    });
    if (!reservatorio) {
      this.logger.warn(
        `Medição descartada: reservatório #${reservatorioId} não encontrado`,
      );
      return null;
    }

    const medicao = this.medicaoRepository.create({
      reservatorio,
      distanciaCm: payload.distance_cm,
      nivelPercentual: payload.level_pct,
      isCalibrado: payload.is_calibrated,
      rssi: payload.rssi ?? null,
      uptimeS: payload.uptime_s ?? null,
    });
    return this.medicaoRepository.save(medicao);
  }

  findByReservatorio(reservatorioId: number, limit = 50) {
    return this.medicaoRepository.find({
      where: { reservatorio: { id: reservatorioId } },
      order: { criadoEm: 'DESC' },
      take: limit,
    });
  }

  findUltima(reservatorioId: number) {
    return this.medicaoRepository.findOne({
      where: { reservatorio: { id: reservatorioId } },
      order: { criadoEm: 'DESC' },
    });
  }
}
