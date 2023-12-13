import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
  name: process.env.SERVICE_NAME || 'API-GATEWAY',
  host: process.env.ENV_HOST || 'localhost',
  port: Number(process.env.ENV_PORT) || 3000,
  environment: process.env.ENV || 'develop'
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