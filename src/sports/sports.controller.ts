import { Body, Controller, Get, Post } from '@nestjs/common';
import { SportsService } from './sports.service';
import { Sport } from './sport.interface';
import { CreateSportDto } from './dto/create-sport.dto';

@Controller('sports')
export class SportsController {
  constructor(private readonly sportService: SportsService) {}

  @Post('/create')
  async createSport(
    @Body()
    sportData: CreateSportDto,
  ): Promise<Sport> {
    return await this.sportService.createSport(sportData);
  }

  @Get('/all')
  async getAllSports(): Promise<Sport[]> {
    return await this.sportService.getSports();
  }
}
