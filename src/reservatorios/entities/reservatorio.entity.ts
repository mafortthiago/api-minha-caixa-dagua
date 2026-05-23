import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Medicao } from '../../medicoes/entities/medicao.entity';

@Entity('reservatorios')
export class Reservatorio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  nome!: string;

  @Column({ type: 'int' })
  altura!: number;

  @Column({ type: 'float', nullable: true })
  distanciaCheioCm!: number | null;

  @Column({ type: 'float', nullable: true })
  distanciaVazioCm!: number | null;

  @OneToMany(() => Medicao, (m) => m.reservatorio)
  medicoes!: Medicao[];
}
