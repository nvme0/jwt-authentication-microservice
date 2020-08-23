import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserEntity, User } from "./models/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>
  ) {}

  async findById(id: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!!user) {
      const { password, ...result } = user;
      return result;
    }
    return undefined;
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.userRepo.findOneOrFail({ where: { id } });
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!!user) {
      const { password, ...result } = user;
      return result;
    }
    return undefined;
  }

  async findForAuth(email: string): Promise<UserEntity | undefined> {
    return await this.userRepo.findOne({ where: { email } });
  }

  async save(user: UserEntity) {
    return await this.userRepo.save(user);
  }

  async update(id: string, data: Partial<UserEntity>) {
    const { id: userId, email, password, ...userData } = data;
    await this.userRepo.update({ id }, { ...userData });
    return await this.findById(id);
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const user = await this.findById(id);
    if (user) {
      await this.userRepo.delete(user.id);
      return { deleted: true };
    }
    return { deleted: false };
  }

  async confirmEmail(email: string): Promise<boolean> {
    await this.userRepo.update({ email }, { confirmed: true });
    const user = await this.findByEmail(email);
    if (!!user) {
      return user.confirmed;
    }
    return false;
  }

  async exists(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ["id"]
    });
    return !!user;
  }
}
