import * as Joi from 'joi';

export const envConfigValidation = Joi.object({
  MONGO_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
});