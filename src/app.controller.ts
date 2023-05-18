import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/user')
  createUser(@Body() body: CreateUserDto) {
    return this.appService.createUser(body);
  }

  @Get('user')
  getAllUsers(){
    return this.appService.getAllUsers()
  }
}
