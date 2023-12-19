import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    try {
      await axios.get("http://localhost:4566/restapis/dhoza8d127/test/_user_request_/miRecurso")
    } catch (error) {
      this.logger.log("The service is sleeping...")
    }
  }
}
//EVERY_DAY_AT_MIDNIGHT