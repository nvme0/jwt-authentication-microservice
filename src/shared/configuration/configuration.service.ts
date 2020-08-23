import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Configuration } from "src/shared/configuration/configuration.enum";

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService) {}

  get(propertyPath: string) {
    return this.configService.get(propertyPath);
  }

  get typeOrmConfig(): any {
    return {
      type: this.configService.get<string>(Configuration.DB_TYPE),
      host: this.configService.get<string>(Configuration.DB_HOST),
      port: this.configService.get<number>(Configuration.DB_PORT),
      database: this.configService.get<string>(Configuration.DB_NAME),
      username: this.configService.get<string>(Configuration.DB_USERNAME),
      password: this.configService.get<string>(Configuration.DB_PASSWORD),
      synchronize: false,
      logging: this.isDevelopment
    };
  }

  get isDevelopment(): boolean {
    return this.configService.get(Configuration.NODE_ENV) === "development";
  }
}
