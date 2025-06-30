import { Test, TestingModule } from '@nestjs/testing';
import { SportsController } from './sports.controller';
import { SportsService } from './sports.service';
import { CacheModule } from '@nestjs/cache-manager';

describe('SportsController', () => {
  let controller: SportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [SportsController],
      providers: [SportsService],
    }).compile();

    controller = module.get<SportsController>(SportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
