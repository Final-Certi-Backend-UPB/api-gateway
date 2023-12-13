import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EUREKA, EurekaService } from './services/eureka.service';
import { UserProxyMiddleware } from './middlewares/user-proxy.middleware';
import { PatientProxyMiddleware } from './middlewares/patient-proxy.middleware';
import { DoctorProxyMiddleware } from './middlewares/doctor-proxy.middleware';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { auth } from './config/config';
import { HttpModule } from '@nestjs/axios';

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
      .apply(UserProxyMiddleware).forRoutes("/users")
      .apply(PatientProxyMiddleware).forRoutes("/patients")
      .apply(DoctorProxyMiddleware).forRoutes("/doctors")
  }
}
