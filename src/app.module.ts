import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SportsModule } from './sports/sports.module';
import { MembersModule } from './members/members.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env automatically
    SportsModule,
    MembersModule,
    SubscriptionsModule,
    CacheModule.register({
      ttl: 60, // default: 60 seconds
      isGlobal: true, // optional
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
