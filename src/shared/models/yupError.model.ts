import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class YupError {
  @Field(() => String)
  path: string;

  @Field(() => String)
  message: string;
}
