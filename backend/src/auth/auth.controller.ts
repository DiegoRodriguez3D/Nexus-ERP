import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.validateUser(signInDto.email, signInDto.password)
      .then(user => {
        if (!user) {
          throw new Error('Invalid credentials'); // Should use HttpException
        }
        return this.authService.login(user);
      });
  }
}
