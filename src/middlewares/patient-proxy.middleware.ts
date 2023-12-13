import { ForbiddenException, Inject, NestMiddleware, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { RequestHandler, createProxyMiddleware } from "http-proxy-middleware";
import { auth, service } from "src/config/config";
import { Role } from "src/enums/role.enum";
import { User } from "src/models/user.model";
import { EUREKA, EurekaService } from "src/services/eureka.service";
import { extractTokenFromHeader } from "src/utils/extractToken";

export class PatientProxyMiddleware implements NestMiddleware {
  constructor(
    @Inject(EUREKA)
    private readonly eurekaService: EurekaService,
    private readonly jwtService: JwtService,
  ) { }

  private proxy: RequestHandler;
  private PATIENT_SERVICE_URL: string;

  getProxy() {
    const serviceUrl = this.eurekaService.getServiceUrl(service.patient);
    if (!serviceUrl) {
      throw new ServiceUnavailableException("PATIENT-SERVICE is not available in this moment");
    }

    if (serviceUrl === this.PATIENT_SERVICE_URL) {
      return this.proxy;
    }

    this.PATIENT_SERVICE_URL = serviceUrl;

    const newProxy = createProxyMiddleware({
      target: this.PATIENT_SERVICE_URL,
      pathRewrite: {
        "/api/v1/patients": "/patients"
      },
      changeOrigin: true,
    });

    this.proxy = newProxy;

    return this.proxy;
  }

  async use(req: Request, res: Response, next: (error?: any) => void) {
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException("No Token is provided");
    }

    let userInfo: User;

    try {
      userInfo = await this.jwtService.verifyAsync(
        token, { secret: auth.jwtSecret }
      );
    } catch {
      throw new UnauthorizedException("Invalid Token");
    }

    if (userInfo.role !== Role.PATIENT) {
      throw new ForbiddenException("Only PATIENT users have access");
    }

    req['user'] = userInfo;
    const proxy = this.getProxy();
    proxy(req, res, next);
  }
}