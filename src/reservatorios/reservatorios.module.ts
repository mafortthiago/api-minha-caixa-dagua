import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservatoriosService } from './reservatorios.service';
import { ReservatoriosController } from './reservatorios.controller';
import { Reservatorio } from './entities/reservatorio.entity';
import { MedicoesModule } from '../medicoes/medicoes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservatorio]), MedicoesModule],
  controllers: [ReservatoriosController],
  providers: [ReservatoriosService],
})
export class ReservatoriosModule {}
