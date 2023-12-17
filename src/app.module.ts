import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { auth } from './config/config';
import { AuthController } from './controllers/auth.controller';
import { DoctorProxyMiddleware } from './middlewares/proxy/doctor-proxy.middleware';
import { PatientProxyMiddleware } from './middlewares/proxy/patient-proxy.middleware';
import { UserProxyMiddleware } from './middlewares/proxy/user-proxy.middleware';
import { AuthService } from './services/auth.service';
import { EUREKA, EurekaService } from './services/eureka.service';
import { MorganMiddleware } from './middlewares/morgan.middleware';
import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from './config/rateLimiter';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      global: true,
      secret: auth.jwtSecret,
      signOptions: { expiresIn: auth.jwtExpTime },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: EUREKA,
      useClass: EurekaService
    },
    AuthService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(rateLimit(rateLimitConfig)).forRoutes("/")
      .apply(MorganMiddleware).forRoutes("/")
      .apply(UserProxyMiddleware).forRoutes("/users")
      .apply(PatientProxyMiddleware).forRoutes("/patients")
      .apply(DoctorProxyMiddleware).forRoutes("/doctors")
  }
}
