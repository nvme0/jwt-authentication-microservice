import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";
import { UserEntity } from "./models/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService, UserResolver],
  controllers: [],
  exports: [UserService]
})
export class UserModule {}
