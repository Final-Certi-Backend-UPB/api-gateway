import { ForbiddenException, Inject, Logger, NestMiddleware, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { RequestHandler, createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { auth, service } from "src/config/config";
import { Role } from "src/enums/role.enum";
import { User } from "src/models/user.model";
import { EUREKA, EurekaService } from "src/services/eureka.service";
import { extractTokenFromHeader } from "src/utils/extractToken";

export class UserProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserProxyMiddleware.name);

  constructor(
    @Inject(EUREKA)
    private readonly eurekaService: EurekaService,
    private readonly jwtService: JwtService,

  ) { }

  private proxy: RequestHandler;
  private USER_SERVICE_URL: string;

  getProxy() {
    const serviceUrl = this.eurekaService.getServiceUrl(service.user);
    if (!serviceUrl) {
      this.logger.error("USER-SERVICE is not available in this moment");
      throw new ServiceUnavailableException("USER-SERVICE is not available in this moment");
    }

    if (serviceUrl === this.USER_SERVICE_URL) {
      return this.proxy;
    }

    this.USER_SERVICE_URL = serviceUrl;

    const newProxy = createProxyMiddleware({
      target: this.USER_SERVICE_URL,
      pathRewrite: {
        "/api/v1/users": "/"
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

    if (userInfo.role !== Role.ADMIN) {
      throw new ForbiddenException("Only ADMIN users have access");
    }

    req.headers['user'] = userInfo.userId;

    const proxy = this.getProxy();
    proxy(req, res, next);
  }
}