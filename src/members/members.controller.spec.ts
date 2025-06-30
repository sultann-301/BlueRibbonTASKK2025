/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;

  const mockMembersService = {
    createMember: jest.fn(),
    getMember: jest.fn(),
    updateMember: jest.fn(),
    deleteMember: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockMembersService,
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMember', () => {
    it('should create a member successfully', async () => {
      const createMemberDto: CreateMemberDto = {
        first_name: 'John',
        last_name: 'Doe',
        birthdate: new Date('1990-01-01'),
        subscription_date: new Date(),
        gender: 'male',
      };

      const expectedResult = {
        id: '1',
        ...createMemberDto,
      };

      mockMembersService.createMember.mockResolvedValue(expectedResult);

      const result = await controller.createMember(createMemberDto);

      expect(service.createMember).toHaveBeenCalledWith(createMemberDto);
      expect(service.createMember).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when service throws error', async () => {
      const createMemberDto: CreateMemberDto = {
        first_name: 'John',
        last_name: 'Doe',
        birthdate: new Date('1990-01-01'),
        subscription_date: new Date(),
        gender: 'male',
      };

      const errorMessage = 'Error creating member';
      mockMembersService.createMember.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.createMember(createMemberDto)).rejects.toThrow(
        errorMessage,
      );
      expect(service.createMember).toHaveBeenCalledWith(createMemberDto);
    });
  });

  describe('getMember', () => {
    it('should get a member successfully', async () => {
      const memberId = '1';
      const expectedResult = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        birthdate: new Date('1990-01-01'),
        subscription_date: new Date(),
        gender: 'male',
      };

      mockMembersService.getMember.mockResolvedValue(expectedResult);

      const result = await controller.getMember(memberId);

      expect(service.getMember).toHaveBeenCalledWith(memberId);
      expect(service.getMember).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when service throws error', async () => {
      const memberId = '1';
      const errorMessage = 'Member not found';

      mockMembersService.getMember.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getMember(memberId)).rejects.toThrow(
        errorMessage,
      );
      expect(service.getMember).toHaveBeenCalledWith(memberId);
    });
  });

  describe('updateMember', () => {
    it('should update a member successfully', async () => {
      const memberId = '1';
      const updateMemberDto: UpdateMemberDto = {
        first_name: 'Jane',
        last_name: 'Smith',
      };

      const expectedResult = {
        id: '1',
        first_name: 'Jane',
        last_name: 'Smith',
        birthdate: new Date('1990-01-01'),
        subscription_date: new Date(),
        gender: 'female',
      };

      mockMembersService.updateMember.mockResolvedValue(expectedResult);

      const result = await controller.updateMember(memberId, updateMemberDto);

      expect(service.updateMember).toHaveBeenCalledWith(
        memberId,
        updateMemberDto,
      );
      expect(service.updateMember).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when service throws error', async () => {
      const memberId = '1';
      const updateMemberDto: UpdateMemberDto = {
        first_name: 'Jane',
      };
      const errorMessage = 'Error updating member';

      mockMembersService.updateMember.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(
        controller.updateMember(memberId, updateMemberDto),
      ).rejects.toThrow(errorMessage);
      expect(service.updateMember).toHaveBeenCalledWith(
        memberId,
        updateMemberDto,
      );
    });
  });

  describe('deleteMember', () => {
    it('should delete a member successfully', async () => {
      const memberId = '1';
      const expectedResult = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
      };

      mockMembersService.deleteMember.mockResolvedValue(expectedResult);

      const result = await controller.deleteMember(memberId);

      expect(service.deleteMember).toHaveBeenCalledWith(memberId);
      expect(service.deleteMember).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when service throws error', async () => {
      const memberId = '1';
      const errorMessage = 'Error deleting member';

      mockMembersService.deleteMember.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.deleteMember(memberId)).rejects.toThrow(
        errorMessage,
      );
      expect(service.deleteMember).toHaveBeenCalledWith(memberId);
    });
  });
});
