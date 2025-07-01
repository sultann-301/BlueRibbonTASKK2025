/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { supabase } from '../supabase.client';
import { Member } from './member.interface';
import { CreateMemberDto } from './dto/create-member.dto';
import { Logger } from '@nestjs/common';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);
  async createMember(memberData: CreateMemberDto) {
    // Remove all undefined fields from the payload
    const cleanedData = Object.fromEntries(
      Object.entries(memberData).filter(([_, v]) => v !== undefined),
    );
    this.logger.log('cleaned data', cleanedData);
    const { data, error } = await supabase
      .from('members')
      .insert([cleanedData])
      .select('*')
      .single<Member>();
    if (error) {
      this.logger.error('Failed to create member', {
        error: error.message,
        memberData,
      });

      // Handle specific database errors
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException('Member with this email already exists');
      }

      if (error.code === '23503') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid central member reference');
      }

      // Generic database error
      throw new InternalServerErrorException('Failed to create member');
    }
    this.logger.log('Member created successfully', { memberId: data.id });
    return data;
  }

  async deleteMember(id: string) {
    const { data, error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
      .select('*')
      .single<Member>();

    if (error) {
      this.logger.error('Failed to delete member', {
        error: error.message,
        memberId: id,
        errorCode: error.code,
      });

      // Handle specific database errors
      if (error.code === 'PGRST116') {
        // No rows found (member doesn't exist)
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      if (error.code === '23503') {
        // Foreign key constraint violation
        throw new BadRequestException(
          'Cannot delete member: member has active subscriptions or family relationships',
        );
      }

      // Generic database error
      throw new InternalServerErrorException('Failed to delete member');
    }

    // Check if member was actually found and deleted
    if (!data) {
      this.logger.warn('Delete operation completed but no member was found', {
        memberId: id,
      });
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    this.logger.log('Member deleted successfully', {
      memberId: data.id,
      memberName: `${data.first_name} ${data.last_name}`,
    });

    return data;
  }

  async updateMember(id: string, updates: Partial<UpdateMemberDto>) {
    this.logger.log('UPDATES RECIEVED', updates);

    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single<Member>();
    console.log(data);

    if (error) {
      this.logger.error('Failed to update member', {
        error: error.message,
        memberId: id,
        updates,
        errorCode: error.code,
        data: data,
      });

      // Handle specific database errors
      if (error.code === 'PGRST116') {
        // No rows found (member doesn't exist)
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          'Member with this information already exists',
        );
      }

      if (error.code === '23503') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid central member reference');
      }

      if (error.code === '23514') {
        // Check constraint violation (e.g., invalid gender)
        throw new BadRequestException(
          'Invalid member data: check gender and other constraints',
        );
      }

      // Generic database error
      throw new InternalServerErrorException('Failed to update member');
    }

    this.logger.log('Member updated successfully', {
      memberId: data.id,
      memberName: `${data.first_name} ${data.last_name}`,
      updatedFields: Object.keys(updates),
    });

    return data;
  }

  async getMember(id: string) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single<Member>();
    if (error) {
      this.logger.error('Failed to get member', {
        error: error.message,
        memberId: id,
        errorCode: error.code,
      });

      // Handle specific database errors
      if (error.code === 'PGRST116') {
        // No rows found (member doesn't exist)
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      // Generic database error
      throw new InternalServerErrorException('Failed to retrieve member');
    }

    this.logger.log('Member retrieved successfully', {
      memberId: data.id,
      memberName: `${data.first_name} ${data.last_name}`,
    });

    return data;
  }
}
