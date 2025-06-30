import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly MemberService: MembersService) {}

  @Post('/create')
  async createMember(@Body() memberData: CreateMemberDto) {
    return this.MemberService.createMember(memberData);
  }

  //just like in sports module, assuming the id is passed from the frontend to the backend
  //like its stored in the buttons id for example
  @Get(':id')
  async getMember(@Param('id') id: string) {
    return this.MemberService.getMember(id);
  }

  @Patch('/update/:id')
  async updateMember(
    @Param('id') id: string,
    @Body() updates: UpdateMemberDto,
  ) {
    return this.MemberService.updateMember(id, updates);
  }

  @Delete('/delete/:id')
  async deleteMember(@Param('id') id: string) {
    return this.MemberService.deleteMember(id);
  }
}
