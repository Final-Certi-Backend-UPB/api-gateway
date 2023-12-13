import { Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { EUREKA, EurekaService } from './eureka.service';
import { HttpService } from '@nestjs/axios';
import { service } from 'src/config/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { User } from 'src/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    @Inject(EUREKA)
    private readonly eurekaService: EurekaService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService
  ) { }

  async signIn(email: string, password: string): Promise<string> {
    const serviceUrl = this.eurekaService.getServiceUrl(service.user);
    if (!serviceUrl) {
      throw new ServiceUnavailableException("USER-SERVICE is not available in this moment");
    }

    const { data } = await firstValueFrom(
      this.httpService.post(serviceUrl + "/auth/login", { email, password }).pipe(
        catchError((error: AxiosError) => {
          Logger.warn(error.message);
          throw new UnauthorizedException("Incorrect user or password");
        })
      )
    )

    Logger.log(data.message);

    const userInfo = data.data as User;
    const token = await this.jwtService.signAsync(userInfo);

    return token;
  }
}