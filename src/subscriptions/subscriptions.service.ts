import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { supabase } from '../supabase.client';
import { SubscribeMemberDto } from './dto/create-sub.dto';
import { UnsubscribeMemberDto } from './dto/delete_sub.dto';

// Custom exceptions for better error categorization
export class SubscriptionNotFoundError extends NotFoundException {
  constructor(memberId: string, sportId: string) {
    super(
      `Subscription not found for member '${memberId}' and sport '${sportId}'`,
    );
  }
}

export class SubscriptionAlreadyExistsError extends ConflictException {
  constructor(memberId: string, sportId: string) {
    super(`Member '${memberId}' is already subscribed to sport '${sportId}'`);
  }
}

export class SubscriptionValidationError extends BadRequestException {
  constructor(message: string) {
    super(`Subscription validation failed: ${message}`);
  }
}

export class SubscriptionDatabaseError extends InternalServerErrorException {
  constructor(operation: string, originalError: string) {
    super(
      `Subscription database operation '${operation}' failed: ${originalError}`,
    );
  }
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  async subscribeMember(dto: SubscribeMemberDto) {
    try {
      // Validate input
      this.validateDto(dto);

      const { member_id, sport_id, type } = dto;
      this.logger.debug(`Subscribing member ${member_id} to sport ${sport_id}`);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ member_id, sport_id, type }])
        .select('*');

      if (error) {
        this.logger.error(
          `Database error while subscribing: ${error.message}`,
          error,
        );

        if (error.code === '23505') {
          // Unique constraint violation
          throw new SubscriptionAlreadyExistsError(
            String(member_id),
            String(sport_id),
          );
        }

        if (error.code === '23503') {
          // Foreign key constraint violation
          throw new SubscriptionValidationError(
            'Invalid member_id or sport_id',
          );
        }

        throw new SubscriptionDatabaseError('subscribe member', error.message);
      }

      this.logger.log(
        `Successfully subscribed member ${member_id} to sport ${sport_id}`,
      );
    } catch (error) {
      if (
        error instanceof SubscriptionValidationError ||
        error instanceof SubscriptionAlreadyExistsError ||
        error instanceof SubscriptionDatabaseError
      ) {
        throw error;
      }

      this.logger.error('Unexpected error while subscribing member', error);
      throw new InternalServerErrorException('Failed to subscribe member');
    }
  }

  async unsubscribeMember(dto: UnsubscribeMemberDto) {
    try {
      // Validate input
      this.validateUnsubscribeDto(dto);

      const { member_id, sport_id } = dto;
      this.logger.debug(
        `Unsubscribing member ${member_id} from sport ${sport_id}`,
      );

      const { data, error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('member_id', member_id)
        .eq('sport_id', sport_id)
        .select('*');

      if (error) {
        this.logger.error(
          `Database error while unsubscribing: ${error.message}`,
          error,
        );
        throw new SubscriptionDatabaseError(
          'unsubscribe member',
          error.message,
        );
      }

      if (!data || data.length === 0) {
        throw new SubscriptionNotFoundError(
          String(member_id),
          String(sport_id),
        );
      }

      this.logger.log(
        `Successfully unsubscribed member ${member_id} from sport ${sport_id}`,
      );
    } catch (error) {
      if (
        error instanceof SubscriptionValidationError ||
        error instanceof SubscriptionNotFoundError ||
        error instanceof SubscriptionDatabaseError
      ) {
        throw error;
      }

      this.logger.error('Unexpected error while unsubscribing member', error);
      throw new InternalServerErrorException('Failed to unsubscribe member');
    }
  }

  private validateDto(dto: SubscribeMemberDto): void {
    if (!dto.member_id || !dto.sport_id || !dto.type) {
      throw new SubscriptionValidationError(
        'member_id, sport_id, and type are required',
      );
    }
  }

  private validateUnsubscribeDto(dto: UnsubscribeMemberDto): void {
    if (!dto.member_id || !dto.sport_id) {
      throw new SubscriptionValidationError(
        'member_id and sport_id are required',
      );
    }
  }
}
