import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities';
import { Repository } from 'typeorm';
import { initialData } from './data/seedData';

@Injectable()
export class SeedService {
  private seedExecuted = false;

  constructor(
    private readonly userService: AuthService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    if (!this.seedExecuted) {
      await this.deleteTables();
      await this.insertNewUsers();
      
      this.seedExecuted = true;

      return 'SEED EXECUTED';
    }

    return 'SEED ALREADY EXECUTED';
  }

  private async deleteTables() {
    await this.userService.removeAllUsers();
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }
}

