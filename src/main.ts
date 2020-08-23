import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const host = AppModule.host;
    const port = AppModule.port;
    const isDev = AppModule.isDev;

    if (isDev) {
      // doesn't affect graphql
      app.enableCors({
        credentials: true,
        origin: "http://localhost:3000"
      });
    }

    await app.listen(port as number, () => {
      console.log(`🚀 Server ready at ${host}:${port}`);
    });
  } catch (error) {
    console.log({ error });
  }
}
bootstrap();
