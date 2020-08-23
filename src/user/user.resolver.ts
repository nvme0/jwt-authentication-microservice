import { Resolver, Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { UserService } from "./user.service";
import { UserEntity, User } from "./models/user.entity";
import { JwtAccessAuthGuard } from "src/auth/guards/jwt-access.guard";
import { CurrentUser } from "src/auth/decorators/currentUser.decorator";

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(JwtAccessAuthGuard)
  async me(@CurrentUser() { id }: { id: string }) {
    return await this.userService.findById(id);
  }
}
