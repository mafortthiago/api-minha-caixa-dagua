import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { MedicaoPayload, MedicoesService } from './medicoes.service';

const TOPIC_DATA = process.env.MQTT_TOPIC_DATA ?? 'oriel_mafort/data';

@Injectable()
export class MqttSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttSubscriberService.name);
  private client?: MqttClient;

  constructor(private readonly medicoesService: MedicoesService) {}

  onModuleInit() {
    const url = process.env.MQTT_URL;
    const reservatorioId = Number(process.env.MEDICAO_RESERVATORIO_ID ?? 1);

    const client = connect(url, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
      clientId: `api-caixa-dagua-${Math.random().toString(16).slice(2, 8)}`,
      reconnectPeriod: 5000,
    });
    this.client = client;

    client.on('connect', () => {
      this.logger.log(`Conectado ao broker MQTT ${url}`);
      client.subscribe(TOPIC_DATA, { qos: 1 }, (err) => {
        if (err) {
          this.logger.error(`Falha ao assinar ${TOPIC_DATA}: ${err.message}`);
        } else {
          this.logger.log(`Assinado em ${TOPIC_DATA}`);
        }
      });
    });

    client.on('error', (err) => {
      this.logger.error(`Erro MQTT: ${err.message}`);
    });

    client.on('reconnect', () => {
      this.logger.warn('Reconectando ao broker MQTT...');
    });

    client.on('message', async (topic, message) => {
      if (topic !== TOPIC_DATA) return;
      try {
        const payload: MedicaoPayload = JSON.parse(message.toString());
        const salva = await this.medicoesService.registrar(
          reservatorioId,
          payload,
        );
        if (salva) {
          this.logger.debug(
            `Medição salva (res #${reservatorioId}): ${payload.distance_cm}cm / ${payload.level_pct}%`,
          );
        }
      } catch (err) {
        this.logger.error(
          `Falha ao processar mensagem: ${(err as Error).message}`,
        );
      }
    });
  }

  async onModuleDestroy() {
    const client = this.client;
    if (client) {
      await new Promise<void>((resolve) =>
        client.end(false, {}, () => resolve()),
      );
    }
  }
}
