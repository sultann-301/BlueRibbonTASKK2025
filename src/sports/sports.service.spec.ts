import { SportsService } from './sports.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { supabase } from '../supabase.client';

jest.mock('../supabase.client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('SportService', () => {
  let service: SportsService;

  beforeEach(() => {
    service = new SportsService();
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
      single: jest
        .fn()
        .mockResolvedValue({ data: { id: '123', ...dto }, error: null }),
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
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockInsert);

    await expect(service.createSport(dto)).rejects.toThrow('Insert failed');
  });
});
