import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

import { ConfigurationService } from "src/shared/configuration/configuration.service";
import { Configuration } from "src/shared/configuration/configuration.enum";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  "jwt-access"
) {
  constructor(private readonly configurationService: ConfigurationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configurationService.get(Configuration.JWT_ACCESS_SECRET)
    });
  }

  async validate(payload: { sub: string }) {
    return { id: payload.sub };
  }
}
