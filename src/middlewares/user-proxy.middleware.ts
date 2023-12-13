import { Inject, NestMiddleware, ServiceUnavailableException } from "@nestjs/common";
import { Request, Response } from "express";
import { RequestHandler, createProxyMiddleware } from "http-proxy-middleware";
import { service } from "src/config/config";
import { EUREKA, EurekaService } from "src/services/eureka.service";

export class UserProxyMiddleware implements NestMiddleware {
  constructor(
    @Inject(EUREKA)
    private readonly eurekaService: EurekaService
  ) { }

  private proxy: RequestHandler;
  private USER_SERVICE_URL: string;

  getProxy() {
    const serviceUrl = this.eurekaService.getServiceUrl(service.user);
    if (!serviceUrl) {
      throw new ServiceUnavailableException("USER-SERVICE is not available in this moment");
    }

    if (serviceUrl === this.USER_SERVICE_URL) {
      return this.proxy;
    }

    this.USER_SERVICE_URL = serviceUrl;

    const newProxy = createProxyMiddleware({
      target: this.USER_SERVICE_URL,
      pathRewrite: {
        "/api/v1/users": "/users"
      },
      changeOrigin: true,
    });

    this.proxy = newProxy;

    return this.proxy;
  }

  use(req: Request, res: Response, next: (error?: any) => void) {
    // TODO: Verificar token con rol ADMIN
    const proxy = this.getProxy();
    proxy(req, res, next);
  }
}