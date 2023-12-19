import { LogLevel } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
  name: process.env.SERVICE_NAME || 'API-GATEWAY',
  host: process.env.ENV_HOST || 'localhost',
  port: Number(process.env.ENV_PORT) || 3000,
  environment: process.env.ENV || 'develop',
  logLevel: (process.env.LOG_LEVEL || 'debug') as LogLevel
};

export const eureka = {
  host: process.env.EUREKA_HOST || 'localhost',
  port: Number(process.env.EUREKA_PORT) || 8761,
}

export const service = {
  user: process.env.USER_SERVICE_NAME || "USER-SERVICE",
  patient: process.env.PATIENT_SERVICE_NAME || "PATIENT-SERVICE",
  doctor: process.env.DOCTOR_SERVICE_NAME || "DOCTOR-SERVICE",
}

export const auth = {
  jwtSecret: process.env.JWT_SECRET || "my_secret",
  jwtExpTime: process.env.JWT_EXP_TIME || "1h",
}

export const rateLimiter = {
  maxReqPerMinute: Number(process.env.MAX_REQ_PER_MINUTE) || 100
}