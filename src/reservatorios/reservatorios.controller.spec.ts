import { Test, TestingModule } from '@nestjs/testing';
import { ReservatoriosController } from './reservatorios.controller';
import { ReservatoriosService } from './reservatorios.service';

describe('ReservatoriosController', () => {
  let controller: ReservatoriosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservatoriosController],
      providers: [ReservatoriosService],
    }).compile();

    controller = module.get<ReservatoriosController>(ReservatoriosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
