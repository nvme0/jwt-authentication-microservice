import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as yup from "yup";

import { ConfigurationService } from "./configuration/configuration.service";

const validationSchema = yup.object().shape({
  APP_PORT: yup
    .number()
    .min(0)
    .max(65535)
    .default(5000),
  APP_HOST: yup.string().default("http://localhost"),
  NODE_ENV: yup
    .string()
    .equals(["development", "production"])
    .default("development"),
  DB_TYPE: yup.string().equals(["mysql", "mariadb"]),
  DB_HOST: yup.string().default("localhost"),
  DB_PORT: yup
    .number()
    .min(0)
    .max(65535)
    .default(3306),
  DB_NAME: yup.string(),
  DB_USERNAME: yup.string(),
  DB_PASSWORD: yup.string(),
  JWT_SECRET: yup.string(),
  JWT_MAX_AGE_S: yup
    .number()
    .min(0)
    .default(3600000),
  REDIS_PORT: yup
    .number()
    .min(0)
    .max(65535)
    .default(6379)
});

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema
    })
  ],
  providers: [ConfigurationService],
  exports: [ConfigurationService]
})
export class SharedModule {}
