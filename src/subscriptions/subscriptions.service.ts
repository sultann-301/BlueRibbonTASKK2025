import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { SubscribeMemberDto } from './dto/create-sub.dto';
import { UnsubscribeMemberDto } from './dto/delete_sub.dto';
@Injectable()
export class SubscriptionsService {
  async subscribeMember(dto: SubscribeMemberDto) {
    const { member_id, sport_id, type } = dto;
    console.log(member_id);
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{ member_id, sport_id, type }]);

    if (error) {
      throw new Error(`Error subscribing: ${error.message}`);
    }

    console.log(`Subscribed member ${member_id} to sport ${sport_id}`);
    return data;
  }

  async unsubscribeMember(dto: UnsubscribeMemberDto) {
    const { member_id, sport_id } = dto;
    const { data, error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('member_id', member_id)
      .eq('sport_id', sport_id);

    if (error) {
      throw new Error(`Error unsubscribing: ${error.message}`);
    }

    console.log(`UnSubscribed member ${member_id} from sport ${sport_id}`);
    return data;
  }
}
