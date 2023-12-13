import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from 'src/dtos/login.dto';
import { TokenDto } from 'src/dtos/token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDto): Promise<TokenDto> {
    const token = await this.authService.signIn(dto.email, dto.password);
    return {
      message: "User Signed In Successfully",
      jwt: token,
    }
  }
}