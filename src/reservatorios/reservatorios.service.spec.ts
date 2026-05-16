import { Test, TestingModule } from '@nestjs/testing';
import { ReservatoriosService } from './reservatorios.service';

describe('ReservatoriosService', () => {
  let service: ReservatoriosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservatoriosService],
    }).compile();

    service = module.get<ReservatoriosService>(ReservatoriosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
