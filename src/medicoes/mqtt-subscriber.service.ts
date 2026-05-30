import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { connect, MqttClient } from 'mqtt';
import { MedicaoPayload, MedicoesService } from './medicoes.service';
import { Reservatorio } from '../reservatorios/entities/reservatorio.entity';
import { decryptPayload } from '../crypto/payload-crypto';

const TOPIC_DATA = process.env.MQTT_TOPIC_DATA ?? 'oriel_mafort/data';
const TOPIC_CMD = process.env.MQTT_TOPIC_CMD ?? 'oriel_mafort/cmd';
const TOPIC_ACK = process.env.MQTT_TOPIC_ACK ?? 'oriel_mafort/ack';

interface AckPayload {
  cmd?: string;
  result?: string;
  value_cm?: number;
  is_calibrated?: boolean;
}

@Injectable()
export class MqttSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttSubscriberService.name);
  private client?: MqttClient;
  private readonly reservatorioId = Number(
    process.env.MEDICAO_RESERVATORIO_ID ?? 1,
  );

  constructor(
    private readonly medicoesService: MedicoesService,
    @InjectRepository(Reservatorio)
    private readonly reservatorioRepository: Repository<Reservatorio>,
  ) {}

  onModuleInit() {
    const url = process.env.MQTT_URL ?? 'mqtt://localhost:1883';

    const client = connect(url, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
      clientId: `api-caixa-dagua-${Math.random().toString(16).slice(2, 8)}`,
      reconnectPeriod: 5000,
    });
    this.client = client;

    client.on('connect', () => {
      this.logger.log(`Conectado ao broker MQTT ${url}`);
      for (const topic of [TOPIC_DATA, TOPIC_ACK]) {
        client.subscribe(topic, { qos: 1 }, (err) => {
          if (err) {
            this.logger.error(`Falha ao assinar ${topic}: ${err.message}`);
          } else {
            this.logger.log(`Assinado em ${topic}`);
          }
        });
      }
    });

    client.on('error', (err) => {
      this.logger.error(`Erro MQTT: ${err.message}`);
    });

    client.on('reconnect', () => {
      this.logger.warn('Reconectando ao broker MQTT...');
    });

    client.on('message', async (topic, message) => {
      try {
        if (topic === TOPIC_DATA) {
          const payload = decryptPayload<MedicaoPayload>(message.toString());
          const salva = await this.medicoesService.registrar(
            this.reservatorioId,
            payload,
          );
          if (salva) {
            this.logger.debug(
              `Medição salva (res #${this.reservatorioId}): ${payload.distance_cm}cm / ${payload.level_pct}%`,
            );
          }
        } else if (topic === TOPIC_ACK) {
          const payload: AckPayload = JSON.parse(message.toString());
          await this.processarAck(payload);
        }
      } catch (err) {
        this.logger.error(
          `Falha ao processar mensagem (${topic}): ${(err as Error).message}`,
        );
      }
    });
  }

  private async processarAck(payload: AckPayload) {
    if (payload.result !== 'ok') return;
    if (typeof payload.value_cm !== 'number') return;
    if (payload.cmd !== 'set_full' && payload.cmd !== 'set_empty') return;

    const reservatorio = await this.reservatorioRepository.findOneBy({
      id: this.reservatorioId,
    });
    if (!reservatorio) {
      this.logger.warn(
        `ACK recebido mas reservatório #${this.reservatorioId} não existe`,
      );
      return;
    }

    if (payload.cmd === 'set_full') {
      reservatorio.distanciaCheioCm = payload.value_cm;
    } else {
      reservatorio.distanciaVazioCm = payload.value_cm;
    }
    await this.reservatorioRepository.save(reservatorio);
    this.logger.log(
      `[ACK] ${payload.cmd} = ${payload.value_cm}cm gravado no reservatório #${this.reservatorioId}`,
    );
  }

  async onModuleDestroy() {
    const client = this.client;
    if (client) {
      await new Promise<void>((resolve) =>
        client.end(false, {}, () => resolve()),
      );
    }
  }

  publishCommand(cmd: string, extra: Record<string, unknown> = {}): void {
    if (!this.client || !this.client.connected) {
      throw new Error('Cliente MQTT não conectado');
    }
    const payload = JSON.stringify({ cmd, ...extra });
    this.client.publish(TOPIC_CMD, payload, { qos: 1 });
    this.logger.log(`[CMD] -> ${TOPIC_CMD}: ${payload}`);
  }
}
