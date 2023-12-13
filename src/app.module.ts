import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EUREKA, EurekaService } from './services/eureka.service';
import { UserProxyMiddleware } from './middlewares/user-proxy.middleware';
import { PatientProxyMiddleware } from './middlewares/patient-proxy.middleware';
import { DoctorProxyMiddleware } from './middlewares/doctor-proxy.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [{
    provide: EUREKA,
    useClass: EurekaService
  }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserProxyMiddleware).forRoutes("/users")
      .apply(PatientProxyMiddleware).forRoutes("/patients")
      .apply(DoctorProxyMiddleware).forRoutes("/doctors")
  }
}
