import { Injectable, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuid } from "uuid";
import * as yup from "yup";
import { hash, compare } from "bcryptjs";
import Redis from "ioredis";

import { AppModule } from "src/app.module";
import { UserService } from "src/user/user.service";

import { formatYupError } from "src/utils/formatYupErrors";
import {
  emailTaken,
  invalidLogin,
  emailNotConfirmed
} from "src/utils/errorMessages";
import { MutationResponse } from "src/shared/models/MutationResponse.model";
import { UserEntity } from "src/user/models/user.entity";
import { ConfigurationService } from "src/shared/configuration/configuration.service";
import { Configuration } from "src/shared/configuration/configuration.enum";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3)
    .max(255)
    .email()
    .required(),
  password: yup
    .string()
    .min(7)
    .max(255)
    .required()
});

@Injectable()
export class AuthService {
  private static redisInstance: Redis.Redis;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configurationService: ConfigurationService
  ) {
    if (!AuthService.redisInstance) {
      AuthService.redisInstance = new Redis({
        keyPrefix: "jwt-refresh_",
        host: this.configurationService.get(Configuration.REDIS_HOST),
        port: this.configurationService.get(Configuration.REDIS_PORT)
      });
    }
  }

  async getUserRefreshToken(id: string): Promise<string> {
    return AuthService.redisInstance.get(id);
  }

  async logout(id: string) {
    return AuthService.redisInstance.del(id);
  }

  async generateAccessToken(id: string) {
    return await this.jwtService.signAsync(
      { sub: id },
      {
        expiresIn: `${this.configurationService.get(
          Configuration.JWT_ACCESS_AGE_S
        )}s`,
        secret: this.configurationService.get(Configuration.JWT_ACCESS_SECRET)
      }
    );
  }

  async generateRefreshToken(id: string) {
    return await this.jwtService.signAsync(
      { sub: id },
      {
        expiresIn: `${this.configurationService.get(
          Configuration.JWT_REFRESH_AGE_S
        )}s`,
        secret: this.configurationService.get(Configuration.JWT_REFRESH_SECRET)
      }
    );
  }

  async login(email: string, password: string): Promise<MutationResponse> {
    const userEntity = await this.userService.findForAuth(email);

    if (!userEntity) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        errors: invalidLogin
      };
    }

    const { id, confirmed } = userEntity;

    if (!confirmed) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        errors: emailNotConfirmed
      };
    }

    if (!(await this.comparePasswords(password, userEntity.password))) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        errors: invalidLogin
      };
    }

    const refresh_token = await this.getUserRefreshToken(id);

    const tokens = {
      access_token: await this.generateAccessToken(id),
      refresh_token: refresh_token || (await this.generateRefreshToken(id))
    };

    await AuthService.redisInstance.set(
      id,
      tokens.refresh_token,
      "ex",
      this.configurationService.get(Configuration.JWT_REFRESH_AGE_S)
    );

    return {
      status: HttpStatus.OK,
      errors: [],
      payload: JSON.stringify(tokens)
    };
  }

  async comparePasswords(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return await compare(password, passwordHash);
  }

  async register({
    email,
    password
  }: {
    email: string;
    password: string;
  }): Promise<MutationResponse> {
    try {
      await schema.validate({ email, password }, { abortEarly: false });
    } catch (error) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        errors: formatYupError(error)
      };
    }

    if (await this.userService.exists(email)) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        errors: emailTaken
      };
    }

    const newUser = new UserEntity();
    newUser.id = uuid();
    newUser.email = email;
    newUser.password = await hash(password, 12);
    newUser.createdAt = new Date();
    newUser.updatedAt = new Date();

    await this.userService.save(newUser);

    return {
      status: HttpStatus.CREATED,
      errors: [],
      payload: `${AppModule.host}:${AppModule.port}/user/confirm`
    };
  }
}
