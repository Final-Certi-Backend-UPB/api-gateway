import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MorganMiddleware.name);

  async use(req: Request, res: Response, next: NextFunction) {
    morgan("':method :url :status :response-time ms - :res[content-length]'", {
      stream: { write: (message) => this.logger.log(message) },
    })(req, res, next);
  }
}