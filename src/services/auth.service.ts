import { HttpException, Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { EUREKA, EurekaService } from './eureka.service';
import { HttpService } from '@nestjs/axios';
import { service } from 'src/config/config';
import { catchError, firstValueFrom, tap } from 'rxjs';
import { AxiosError } from 'axios';
import { User } from 'src/models/user.model';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(EUREKA)
    private readonly eurekaService: EurekaService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService
  ) { }

  async signIn(email: string, password: string): Promise<string> {
    const serviceUrl = this.eurekaService.getServiceUrl(service.user);
    if (!serviceUrl) {
      this.logger.error("USER-SERVICE is not available in this moment");
      throw new ServiceUnavailableException("USER-SERVICE is not available in this moment");
    }

    const { data, status } = await firstValueFrom(
      this.httpService.post(serviceUrl + "/users/check",
        { email, password },
        { validateStatus: null })
        .pipe(
          tap((response) => {
            this.logger.log(response.data.message);
          }),
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw new ServiceUnavailableException("USER-SERVICE is not available in this moment");
          })
        )
    );

    if (status !== 200) {
      throw new HttpException({ ...data, from: service.user }, status);
    }

    const userInfo = data.data as User;
    const token = await this.jwtService.signAsync(userInfo);

    return token;
  }
}