import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicoesModule } from './medicoes/medicoes.module';
import { ReservatoriosModule } from './reservatorios/reservatorios.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 5432),
            username: process.env.DB_USER ?? 'postgres',
            password: process.env.DB_PASSWORD ?? 'senha',
            database: process.env.DB_NAME ?? 'nome_do_banco',
          }),
      ssl:
        process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL
          ? { rejectUnauthorized: false }
          : false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE !== 'false', // apenas em dev!!!
    }),
    ReservatoriosModule,
    MedicoesModule,
  ],
})
export class AppModule {}
