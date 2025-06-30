import { Body, Controller, Delete, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeMemberDto } from './dto/create-sub.dto';
import { UnsubscribeMemberDto } from './dto/delete_sub.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post('/subscribe')
  async subscribeMember(@Body() data: SubscribeMemberDto) {
    return this.subscriptionService.subscribeMember(data);
  }

  @Delete('/unsubscribe')
  async unsubscribeMember(@Body() data: UnsubscribeMemberDto) {
    return this.subscriptionService.unsubscribeMember(data);
  }
}
