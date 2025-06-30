import { SportsService } from './sports.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { supabase } from '../supabase.client';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

jest.mock('../supabase.client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('SportsService', () => {
  let service: SportsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SportsService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          } as Partial<Cache>,
        },
      ],
    }).compile();

    service = moduleRef.get<SportsService>(SportsService);
  });

  it('✅ creates a sport successfully', async () => {
    const dto: CreateSportDto = {
      name: 'Tennis',
      subscription_price: 50,
      allowed_gender: 'male',
    };

    const mockInsert = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: '123', ...dto },
        error: null,
      }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockInsert);

    const result = await service.createSport(dto);
    expect(result).toEqual(expect.objectContaining(dto));
    expect(mockInsert.insert).toHaveBeenCalledWith([dto]);
  });

  it('❌ throws error when Supabase returns an error', async () => {
    const dto: CreateSportDto = {
      name: 'Boxing',
      subscription_price: 60,
      allowed_gender: 'male',
    };

    const mockInsert = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockInsert);

    await expect(service.createSport(dto)).rejects.toThrow('Insert failed');
  });

  it('✅ updates a sport successfully', async () => {
    const dto: UpdateSportDto = { name: 'Updated Tennis' };

    const mockUpdate = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'sport-id', ...dto },
        error: null,
      }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockUpdate);

    const result = await service.updateSport('sport-id', dto);

    expect(result.name).toBe('Updated Tennis');
    expect(mockUpdate.update).toHaveBeenCalledWith(dto);
  });

  it('✅ deletes a sport successfully', async () => {
    const mockSport = {
      id: 'sport-id',
      name: 'Tennis',
      subscription_price: 50,
      allowed_gender: 'male',
    };

    const mockDelete = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSport,
        error: null,
      }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockDelete);

    const result = await service.deleteSport('sport-id');

    expect(result).toEqual(mockSport);
    expect(mockDelete.delete).toHaveBeenCalled();
  });
});
