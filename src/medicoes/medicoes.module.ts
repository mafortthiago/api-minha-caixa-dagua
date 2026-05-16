import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservatorio } from '../reservatorios/entities/reservatorio.entity';
import { Medicao } from './entities/medicao.entity';
import { MedicoesController } from './medicoes.controller';
import { MedicoesService } from './medicoes.service';
import { MqttSubscriberService } from './mqtt-subscriber.service';

@Module({
  imports: [TypeOrmModule.forFeature([Medicao, Reservatorio])],
  controllers: [MedicoesController],
  providers: [MedicoesService, MqttSubscriberService],
})
export class MedicoesModule {}
