import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { supabase } from '../supabase.client';
import { Sport } from './sport.interface';

@Injectable()
export class SportsService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getSports(): Promise<Sport[]> {
    const cached: Sport[] | undefined = await this.cache.get('sports');
    if (cached) return cached;

    const { data, error } = await supabase
      .from('sports')
      .select('name, subscription_price, allowed_gender');
    if (error) {
      throw new Error(`Error fetching sports: ${error.message}`);
    }
    console.log('Fetched sports:', data);
    await this.cache.set('sports', data, 60); // cache for 60s
    return data as Sport[];
  }
  /**
   * Creates a new sport in the database.
   * @param sportData - The data for the new sport.
   * @returns The created sport data.
   * @throws Error if there is an issue with the database operation.
   */
  async createSport(sportData: {
    name: string;
    subscription_price: number;
    allowed_gender: string;
  }) {
    const { data, error } = await supabase
      .from('sports')
      .insert([sportData])
      .select('*')
      .single<Sport>();

    if (error) {
      throw new Error(`Error creating sport: ${error.message}`);
    }
    console.log('Created sport:', data);
    return data;
  }

  async updateSport(id: string, sportData: Partial<Sport>) {
    const { data, error } = await supabase
      .from('sports')
      .update(sportData)
      .eq('id', id)
      .select('*')
      .single<Sport>();
    if (error) {
      throw new Error(`Error updating sport: ${error.message}`);
    }
    console.log('Updated sport:', data);
    return data;
  }

  async deleteSport(id: string) {
    const { data, error } = await supabase
      .from('sports')
      .delete()
      .eq('id', id)
      .select('*')
      .single<Sport>();

    if (error) {
      throw new Error(`Error deleting sport: ${error.message}`);
    }
    console.log('Deleted sport:', data);
    return data;
  }
}
