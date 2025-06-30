import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SportsService } from './sports.service';
import { Sport } from './sport.interface';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';

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

  //for the update and delete, I'm assuming that the uuid from the sports tuple
  //  is passed from the frontend to the controller
  @Patch('/update/:id')
  async updateSport(
    @Param('id') id: string,
    @Body()
    sportData: UpdateSportDto,
  ): Promise<Sport> {
    return await this.sportService.updateSport(id, sportData);
  }

  @Delete('/delete/:id')
  async deleteSport(@Param('id') id: string): Promise<Sport> {
    return await this.sportService.deleteSport(id);
  }
}
