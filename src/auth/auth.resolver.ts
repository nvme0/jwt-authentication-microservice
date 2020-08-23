import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UseGuards, HttpException, HttpStatus } from "@nestjs/common";

import { MutationResponse } from "src/shared/models/MutationResponse.model";
import { UserEntity } from "src/user/models/user.entity";
import { AuthService } from "./auth.service";
import { JwtRefreshAuthGuard } from "./guards/jwt-refresh.guard";
import { CurrentUser } from "./decorators/currentUser.decorator";

@Resolver(() => UserEntity)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => MutationResponse)
  async login(
    @Args("email") email: string,
    @Args("password") password: string
  ): Promise<MutationResponse> {
    return await this.authService.login(email, password);
  }

  @Mutation(() => String)
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(@CurrentUser() { id }: { id: string }): Promise<string> {
    const refreshToken = await this.authService.getUserRefreshToken(id);
    if (refreshToken) {
      return await this.authService.generateAccessToken(id);
    }
    throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtRefreshAuthGuard)
  async logout(@CurrentUser() { id }: { id: string }): Promise<boolean> {
    await this.authService.logout(id);
    return !(await this.authService.getUserRefreshToken(id));
  }

  @Mutation(() => MutationResponse)
  async register(
    @Args("email") email: string,
    @Args("password") password: string
  ): Promise<MutationResponse> {
    return await this.authService.register({ email, password });
  }
}
