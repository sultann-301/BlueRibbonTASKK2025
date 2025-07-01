/* eslint-disable @typescript-eslint/unbound-method */
import { MembersService } from './members.service';
import { supabase } from '../supabase.client';

jest.mock('../supabase.client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('MembersService', () => {
  let service: MembersService;

  beforeEach(() => {
    service = new MembersService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMember', () => {
    it('should create member and return data', async () => {
      const memberData = {
        id: '1',
        first_name: 'John',
        last_name: 'doe',
        birthdate: new Date('1999-11-19'),
        subscription_date: new Date(),
        gender: 'male',
      };
      const mockResponse = { data: memberData, error: null };

      // Create proper chain mock
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await service.createMember(memberData);

      expect(supabase.from).toHaveBeenCalledWith('members');
      expect(mockChain.insert).toHaveBeenCalledWith([memberData]);
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual(memberData);
    });

    it('should throw error if supabase returns error', async () => {
      const memberData = {
        id: '1',
        first_name: 'John',
        last_name: 'doe',
        birthdate: new Date('1999-11-19'),
        subscription_date: new Date(),
        gender: 'male',
      };
      const mockResponse = { data: null, error: { message: 'Fail' } };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(service.createMember(memberData)).rejects.toThrow(
        'Failed to create member',
      );
    });
  });

  describe('deleteMember', () => {
    it('should delete member and return data', async () => {
      const id = '1';
      const mockResponse = { data: { id }, error: null };

      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await service.deleteMember(id);

      expect(supabase.from).toHaveBeenCalledWith('members');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', id);
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual({ id });
    });

    it('should throw error if supabase returns error', async () => {
      const id = '1';
      const mockResponse = { data: null, error: { message: 'Fail' } };

      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(service.deleteMember(id)).rejects.toThrow(
        'Failed to delete member',
      );
    });
  });

  describe('updateMember', () => {
    it('should update member and return data', async () => {
      const id = '1';
      const updates = { first_name: 'Jane' };
      const mockResponse = { data: { id, ...updates }, error: null };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await service.updateMember(id, updates);

      expect(supabase.from).toHaveBeenCalledWith('members');
      expect(mockChain.update).toHaveBeenCalledWith(updates);
      expect(mockChain.eq).toHaveBeenCalledWith('id', id);
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual({ id, ...updates });
    });

    it('should throw error if supabase returns error', async () => {
      const id = '1';
      const updates = { first_name: 'Jane' };
      const mockResponse = { data: null, error: { message: 'Fail' } };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(service.updateMember(id, updates)).rejects.toThrow(
        'Failed to update member',
      );
    });
  });

  describe('getMember', () => {
    it('should get member and return data', async () => {
      const id = '1';
      const mockResponse = { data: { id, first_name: 'John' }, error: null };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await service.getMember(id);

      expect(supabase.from).toHaveBeenCalledWith('members');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('id', id);
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual({ id, first_name: 'John' });
    });

    it('should throw error if supabase returns error', async () => {
      const id = '1';
      const mockResponse = { data: null, error: { message: 'Fail' } };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(service.getMember(id)).rejects.toThrow(
        'Failed to retrieve member',
      );
    });
  });
});
