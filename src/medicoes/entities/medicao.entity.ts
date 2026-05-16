import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservatorio } from '../../reservatorios/entities/reservatorio.entity';

@Entity('medicoes')
export class Medicao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'float' })
  distanciaCm!: number;

  // -1 quando o dispositivo ainda não está calibrado
  @Column({ type: 'float' })
  nivelPercentual!: number;

  @Column({ type: 'boolean' })
  isCalibrado!: boolean;

  @Column({ type: 'int', nullable: true })
  rssi!: number | null;

  @Column({ type: 'int', nullable: true })
  uptimeS!: number | null;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  criadoEm!: Date;

  @ManyToOne(() => Reservatorio, (r) => r.medicoes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  reservatorio!: Reservatorio;
}
