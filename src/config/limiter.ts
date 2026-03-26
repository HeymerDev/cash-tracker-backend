import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 6,
  message: {
    message: "Too many requests from this IP, please try again after a minute",
  },
});
