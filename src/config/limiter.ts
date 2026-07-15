import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: process.env.NODE_ENV === "production" ? 5 : 5,
  message: {
    message: "Too many requests from this IP, please try again after a minute",
  },
});
