import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('users')
  @Auth()
  findAll() {
    return this.authService.findAll();
  }

  @Get('user/:id')
  @Auth()
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.findOneById(id);
  }

  @Patch('user/:id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.update(id, updateUserDto);
  }

  @Delete('user/:id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.remove(id);
  }

  @Get('check-status')
  @Auth()
  checkStatus(
    @GetUser() user: User
  ){
    return this.authService.checkStatus(user)
  }

}
