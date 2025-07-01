import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { supabase } from '../supabase.client';
import { Sport } from './sport.interface';

// Custom exceptions for better error categorization
export class SportNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(`Sport with ID '${id}' not found`);
  }
}

export class SportValidationError extends BadRequestException {
  constructor(message: string) {
    super(`Sport validation failed: ${message}`);
  }
}

export class DatabaseError extends InternalServerErrorException {
  constructor(operation: string, originalError: string) {
    super(`Database operation '${operation}' failed: ${originalError}`);
  }
}

@Injectable()
export class SportsService {
  private readonly logger = new Logger(SportsService.name);
  private readonly CACHE_KEY = 'sports';
  private readonly CACHE_TTL = 60; // 60 seconds

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  /**
   * Retrieves all sports with caching support.
   * @returns Promise<Sport[]> - Array of sports
   * @throws DatabaseError if database operation fails
   */
  async getSports(): Promise<Sport[]> {
    try {
      // Try to get from cache first
      const cached: Sport[] | undefined = await this.cache.get(this.CACHE_KEY);
      if (cached) {
        this.logger.debug('Returning cached sports data');
        return cached;
      }

      this.logger.debug('Fetching sports from database');
      const { data, error } = await supabase
        .from('sports')
        .select('id, name, subscription_price, allowed_gender');

      if (error) {
        this.logger.error(
          `Database error while fetching sports: ${error.message}`,
          error,
        );
        throw new DatabaseError('fetch sports', error.message);
      }

      if (!data) {
        this.logger.warn('No sports data returned from database');
        return [];
      }

      this.logger.log(`Successfully fetched ${data.length} sports`);

      // Cache the results
      try {
        await this.cache.set(this.CACHE_KEY, data, this.CACHE_TTL);
        this.logger.debug('Sports data cached successfully');
      } catch (cacheError) {
        this.logger.warn('Failed to cache sports data', cacheError);
        // Don't throw here - cache failure shouldn't break the main operation
      }

      return data as Sport[];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error; // Re-throw custom errors
      }

      this.logger.error('Unexpected error while getting sports', error);
      throw new InternalServerErrorException('Failed to retrieve sports');
    }
  }

  /**
   * Creates a new sport in the database.
   * @param sportData - The data for the new sport
   * @returns Promise<Sport> - The created sport
   * @throws SportValidationError if validation fails
   * @throws DatabaseError if database operation fails
   */
  async createSport(sportData: {
    name: string;
    subscription_price: number;
    allowed_gender: string;
  }): Promise<Sport> {
    try {
      // Validate input data
      this.validateSportData(sportData);

      this.logger.debug(`Creating sport: ${sportData.name}`);

      const { data, error } = await supabase
        .from('sports')
        .insert([sportData])
        .select('*')
        .single<Sport>();

      if (error) {
        this.logger.error(
          `Database error while creating sport: ${error.message}`,
          error,
        );

        // Handle specific database errors
        if (error.code === '23505') {
          // Unique constraint violation
          throw new SportValidationError(
            `Sport with name '${sportData.name}' already exists`,
          );
        }

        throw new DatabaseError('create sport', error.message);
      }

      if (!data) {
        throw new DatabaseError(
          'create sport',
          'No data returned after insert',
        );
      }

      this.logger.log(
        `Successfully created sport: ${data.name} (ID: ${data.id})`,
      );

      // Invalidate cache
      await this.invalidateCache();

      return data;
    } catch (error) {
      if (
        error instanceof SportValidationError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }

      this.logger.error('Unexpected error while creating sport', error);
      throw new InternalServerErrorException('Failed to create sport');
    }
  }

  /**
   * Updates an existing sport in the database.
   * @param id - The ID of the sport to update
   * @param sportData - Partial sport data to update
   * @returns Promise<Sport> - The updated sport
   * @throws SportNotFoundError if sport doesn't exist
   * @throws SportValidationError if validation fails
   * @throws DatabaseError if database operation fails
   */
  async updateSport(id: string, sportData: Partial<Sport>): Promise<Sport> {
    try {
      if (!id) {
        throw new SportValidationError('Sport ID is required');
      }

      // Validate partial data if provided
      if (Object.keys(sportData).length === 0) {
        throw new SportValidationError(
          'At least one field must be provided for update',
        );
      }

      this.validatePartialSportData(sportData);

      this.logger.debug(`Updating sport with ID: ${id}`);

      const { data, error } = await supabase
        .from('sports')
        .update(sportData)
        .eq('id', id)
        .select('*')
        .single<Sport>();

      if (error) {
        this.logger.error(
          `Database error while updating sport: ${error.message}`,
          error,
        );

        if (error.code === 'PGRST116') {
          // No rows returned
          throw new SportNotFoundError(id);
        }

        if (error.code === '23505') {
          // Unique constraint violation
          throw new SportValidationError(`Sport name already exists`);
        }

        throw new DatabaseError('update sport', error.message);
      }

      if (!data) {
        throw new SportNotFoundError(id);
      }

      this.logger.log(`Successfully updated sport: ${data.name} (ID: ${id})`);

      // Invalidate cache
      await this.invalidateCache();

      return data;
    } catch (error) {
      if (
        error instanceof SportNotFoundError ||
        error instanceof SportValidationError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }

      this.logger.error('Unexpected error while updating sport', error);
      throw new InternalServerErrorException('Failed to update sport');
    }
  }

  /**
   * Deletes a sport from the database.
   * @param id - The ID of the sport to delete
   * @returns Promise<Sport> - The deleted sport data
   * @throws SportNotFoundError if sport doesn't exist
   * @throws DatabaseError if database operation fails
   */
  async deleteSport(id: string): Promise<Sport> {
    try {
      if (!id) {
        throw new SportValidationError('Sport ID is required');
      }

      this.logger.debug(`Deleting sport with ID: ${id}`);

      const { data, error } = await supabase
        .from('sports')
        .delete()
        .eq('id', id)
        .select('*')
        .single<Sport>();

      if (error) {
        this.logger.error(
          `Database error while deleting sport: ${error.message}`,
          error,
        );

        if (error.code === 'PGRST116') {
          // No rows returned
          throw new SportNotFoundError(id);
        }

        throw new DatabaseError('delete sport', error.message);
      }

      if (!data) {
        throw new SportNotFoundError(id);
      }

      this.logger.log(`Successfully deleted sport: ${data.name} (ID: ${id})`);

      // Invalidate cache
      await this.invalidateCache();

      return data;
    } catch (error) {
      if (
        error instanceof SportNotFoundError ||
        error instanceof SportValidationError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }

      this.logger.error('Unexpected error while deleting sport', error);
      throw new InternalServerErrorException('Failed to delete sport');
    }
  }

  /**
   * Retrieves a single sport by ID.
   * @param id - The ID of the sport to retrieve
   * @returns Promise<Sport> - The sport data
   * @throws SportNotFoundError if sport doesn't exist
   * @throws DatabaseError if database operation fails
   */
  async getSportById(id: string): Promise<Sport> {
    try {
      if (!id) {
        throw new SportValidationError('Sport ID is required');
      }

      this.logger.debug(`Fetching sport with ID: ${id}`);

      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('id', id)
        .single<Sport>();

      if (error) {
        this.logger.error(
          `Database error while fetching sport by ID: ${error.message}`,
          error,
        );

        if (error.code === 'PGRST116') {
          // No rows returned
          throw new SportNotFoundError(id);
        }

        throw new DatabaseError('fetch sport by ID', error.message);
      }

      if (!data) {
        throw new SportNotFoundError(id);
      }

      this.logger.debug(`Successfully fetched sport: ${data.name} (ID: ${id})`);
      return data;
    } catch (error) {
      if (
        error instanceof SportNotFoundError ||
        error instanceof SportValidationError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }

      this.logger.error('Unexpected error while getting sport by ID', error);
      throw new InternalServerErrorException('Failed to retrieve sport');
    }
  }

  /**
   * Validates sport data for creation.
   * @param sportData - The sport data to validate
   * @throws SportValidationError if validation fails
   */
  private validateSportData(sportData: {
    name: string;
    subscription_price: number;
    allowed_gender: string;
  }): void {
    if (
      !sportData.name ||
      typeof sportData.name !== 'string' ||
      sportData.name.trim().length === 0
    ) {
      throw new SportValidationError(
        'Name is required and must be a non-empty string',
      );
    }

    if (sportData.name.length > 100) {
      throw new SportValidationError('Name must be 100 characters or less');
    }

    if (
      typeof sportData.subscription_price !== 'number' ||
      sportData.subscription_price < 0
    ) {
      throw new SportValidationError(
        'Subscription price must be a non-negative number',
      );
    }

    if (
      !sportData.allowed_gender ||
      typeof sportData.allowed_gender !== 'string'
    ) {
      throw new SportValidationError(
        'Allowed gender is required and must be a string',
      );
    }

    const validGenders = ['male', 'female', 'both', 'all'];
    if (!validGenders.includes(sportData.allowed_gender.toLowerCase())) {
      throw new SportValidationError(
        `Allowed gender must be one of: ${validGenders.join(', ')}`,
      );
    }
  }

  /**
   * Validates partial sport data for updates.
   * @param sportData - The partial sport data to validate
   * @throws SportValidationError if validation fails
   */
  private validatePartialSportData(sportData: Partial<Sport>): void {
    if (sportData.name !== undefined) {
      if (
        typeof sportData.name !== 'string' ||
        sportData.name.trim().length === 0
      ) {
        throw new SportValidationError('Name must be a non-empty string');
      }
      if (sportData.name.length > 100) {
        throw new SportValidationError('Name must be 100 characters or less');
      }
    }

    if (sportData.subscription_price !== undefined) {
      if (
        typeof sportData.subscription_price !== 'number' ||
        sportData.subscription_price < 0
      ) {
        throw new SportValidationError(
          'Subscription price must be a non-negative number',
        );
      }
    }

    if (sportData.allowed_gender !== undefined) {
      if (typeof sportData.allowed_gender !== 'string') {
        throw new SportValidationError('Allowed gender must be a string');
      }
      const validGenders = ['male', 'female', 'both', 'all'];
      if (!validGenders.includes(sportData.allowed_gender.toLowerCase())) {
        throw new SportValidationError(
          `Allowed gender must be one of: ${validGenders.join(', ')}`,
        );
      }
    }
  }

  /**
   * Invalidates the sports cache.
   */
  private async invalidateCache(): Promise<void> {
    try {
      await this.cache.del(this.CACHE_KEY);
      this.logger.debug('Sports cache invalidated');
    } catch (error) {
      this.logger.warn('Failed to invalidate sports cache', error);
      // Don't throw here - cache invalidation failure shouldn't break the main operation
    }
  }

  /**
   * Manually refresh the sports cache.
   * @returns Promise<Sport[]> - Fresh sports data
   */
  async refreshCache(): Promise<Sport[]> {
    await this.invalidateCache();
    return this.getSports();
  }
}
