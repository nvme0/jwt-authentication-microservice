import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Configuration } from "./shared/configuration/configuration.enum";
import { ConfigurationService } from "./shared/configuration/configuration.service";
import { SharedModule } from "./shared/shared.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UserModule,
    GraphQLModule.forRootAsync({
      useFactory: async ({ isDevelopment }: ConfigurationService) => ({
        autoSchemaFile: "schema.gql",
        playground: isDevelopment
          ? {
              settings: {
                "request.credentials": "include"
              }
            }
          : false,
        debug: isDevelopment,
        context: ({ req }) => ({ req }),
        cors: isDevelopment
          ? {
              credentials: true,
              origin: "http://localhost:3000"
            }
          : false
      }),
      inject: [ConfigurationService]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async ({ typeOrmConfig }: ConfigurationService) => {
        return {
          ...typeOrmConfig,
          autoLoadEntities: false,
          entities: ["./**/*.entity.js"]
        };
      },
      inject: [ConfigurationService]
    })
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_PIPE, useClass: ValidationPipe }]
})
export class AppModule {
  static host: string;
  static port: number | string;
  static redisHost: string;
  static redisPort: number;
  static isDev: boolean;

  constructor(private configurationService: ConfigurationService) {
    AppModule.port = configurationService.get(Configuration.APP_PORT);
    AppModule.host = configurationService.get(Configuration.APP_HOST);
    AppModule.redisHost = configurationService.get(Configuration.REDIS_HOST);
    AppModule.redisPort = Number(
      configurationService.get(Configuration.REDIS_PORT)
    );
    AppModule.isDev = configurationService.isDevelopment;
  }
}
