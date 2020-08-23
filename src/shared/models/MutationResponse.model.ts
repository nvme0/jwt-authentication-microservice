import { ObjectType, Field, Int } from "@nestjs/graphql";

import { YupError } from "src/shared/models/yupError.model";

@ObjectType()
export class MutationResponse {
  @Field(() => Int)
  status: number;

  @Field(() => [YupError], { nullable: "items" })
  errors: YupError[];

  @Field(() => String, { nullable: true })
  payload?: string;
}
