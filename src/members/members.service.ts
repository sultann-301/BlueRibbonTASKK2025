import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { Member } from './member.interface';

@Injectable()
export class MembersService {
  async createMember(memberData: Member) {
    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select('*')
      .single<Member>();

    if (error) {
      throw new Error(`Error creating member: ${error.message}`);
    }
    console.log('Created member:', data);
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
      throw new Error(`Error deleting member: ${error.message}`);
    }
    console.log('Deleted Member', data);
    return data;
  }

  async updateMember(id: string, updates: Partial<Member>) {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single<Member>();

    if (error) {
      throw new Error(`Error updating member: ${error.message}`);
    }
    console.log('Updated member:', data);
    return data;
  }

  async getMember(id: string) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single<Member>();
    if (error) {
      throw new Error(`Error finding member: ${error.message}`);
    }
    console.log('Found Member', data);
    return data;
  }
}
