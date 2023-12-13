import { Inject, NestMiddleware, ServiceUnavailableException } from "@nestjs/common";
import { Request, Response } from "express";
import { RequestHandler, createProxyMiddleware } from "http-proxy-middleware";
import { service } from "src/config/config";
import { EUREKA, EurekaService } from "src/services/eureka.service";

export class DoctorProxyMiddleware implements NestMiddleware {
  constructor(
    @Inject(EUREKA)
    private readonly eurekaService: EurekaService
  ) { }

  private proxy: RequestHandler;
  private DOCTOR_SERVICE_URL: string;

  getProxy() {
    const serviceUrl = this.eurekaService.getServiceUrl(service.doctor);
    if (!serviceUrl) {
      throw new ServiceUnavailableException("DOCTOR-SERVICE is not available in this moment");
    }

    if (serviceUrl === this.DOCTOR_SERVICE_URL) {
      return this.proxy;
    }

    this.DOCTOR_SERVICE_URL = serviceUrl;

    const newProxy = createProxyMiddleware({
      target: this.DOCTOR_SERVICE_URL,
      pathRewrite: {
        "/api/v1/doctors": "/doctors"
      },
      changeOrigin: true,
    });

    this.proxy = newProxy;

    return this.proxy;
  }

  use(req: Request, res: Response, next: (error?: any) => void) {
    // TODO: Verificar token con rol DOCTOR
    const proxy = this.getProxy();
    proxy(req, res, next);
  }
}