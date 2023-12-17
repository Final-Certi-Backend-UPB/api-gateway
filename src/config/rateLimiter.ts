import { Options } from "express-rate-limit";
import { rateLimiter } from "./config";

export const rateLimitConfig: Partial<Options> = {
  windowMs: 60 * 1000,
  limit: rateLimiter.maxReqPerMinute,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: "You have exceed the limit of calls to the API"
}