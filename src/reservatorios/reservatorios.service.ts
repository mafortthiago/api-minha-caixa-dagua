import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservatorioDto } from './dto/create-reservatorio.dto';
import { UpdateReservatorioDto } from './dto/update-reservatorio.dto';
import { Reservatorio } from './entities/reservatorio.entity';

@Injectable()
export class ReservatoriosService {
  constructor(
    @InjectRepository(Reservatorio)
    private readonly reservatorioRepository: Repository<Reservatorio>,
  ) {}

  create(createReservatorioDto: CreateReservatorioDto) {
    const reservatorio = this.reservatorioRepository.create(createReservatorioDto);
    return this.reservatorioRepository.save(reservatorio);
  }

  findAll() {
    return this.reservatorioRepository.find();
  }

  async findOne(id: number) {
    const reservatorio = await this.reservatorioRepository.findOneBy({ id });
    if (!reservatorio) {
      throw new NotFoundException(`Reservatório #${id} não encontrado`);
    }
    return reservatorio;
  }

  async update(id: number, updateReservatorioDto: UpdateReservatorioDto) {
    const reservatorio = await this.reservatorioRepository.preload({
      id,
      ...updateReservatorioDto,
    });
    if (!reservatorio) {
      throw new NotFoundException(`Reservatório #${id} não encontrado`);
    }
    return this.reservatorioRepository.save(reservatorio);
  }

  async remove(id: number) {
    const reservatorio = await this.findOne(id);
    return this.reservatorioRepository.remove(reservatorio);
  }
}
