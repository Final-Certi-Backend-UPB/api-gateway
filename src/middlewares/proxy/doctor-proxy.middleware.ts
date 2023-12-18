import { ForbiddenException, Inject, Logger, NestMiddleware, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { RequestHandler, createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { auth, service } from "src/config/config";
import { Role } from "src/enums/role.enum";
import { User } from "src/models/user.model";
import { EUREKA, EurekaService } from "src/services/eureka.service";
import { extractTokenFromHeader } from "src/utils/extractToken";

export class DoctorProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DoctorProxyMiddleware.name);

  constructor(
    @Inject(EUREKA)
    private readonly eurekaService: EurekaService,
    private readonly jwtService: JwtService,
  ) { }

  private proxy: RequestHandler;
  private DOCTOR_SERVICE_URL: string;

  getProxy() {
    const serviceUrl = this.eurekaService.getServiceUrl(service.doctor);
    if (!serviceUrl) {
      this.logger.error("DOCTOR-SERVICE is not available in this moment");
      throw new ServiceUnavailableException("DOCTOR-SERVICE is not available in this moment");
    }

    if (serviceUrl === this.DOCTOR_SERVICE_URL) {
      return this.proxy;
    }

    this.DOCTOR_SERVICE_URL = serviceUrl;

    const newProxy = createProxyMiddleware({
      target: this.DOCTOR_SERVICE_URL,
      pathRewrite: {
        "/api/v1/": "/"
      },
      changeOrigin: true,
      secure: false,
      onProxyReq: fixRequestBody,
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

    if (userInfo.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only DOCTOR users have access");
    }

    req.headers['user'] = userInfo.userId;

    const proxy = this.getProxy();
    proxy(req, res, next);
  }
}