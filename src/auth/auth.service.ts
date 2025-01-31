import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...userData } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        ...userData,
        email,
        password: hashedPassword,
      });

      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.handleDBExceptionError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        roles: true,
        password: true,
      },
    });

    if (!user) throw new UnauthorizedException('Credentials are not valid');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid');

    delete user.password;
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async findAll() {
    const users = await this.userRepository.find({
      where: { isActive: true },
    });

    return users;
  }

  async findOneById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${userId} not found or is not active`,
      );
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...toUpdateUser } = updateUserDto;

    let updatePassword: string;

    if (password) {
      updatePassword = bcrypt.hashSync(password, 10);
    }

    const user = await this.userRepository.preload({
      id,
      password: updatePassword,
      ...toUpdateUser,
    });

    if (!user) throw new NotFoundException(`User with id: ${id} not found`);

    try {
      await this.userRepository.save(user);
    } catch (error) {
      this.handleDBExceptionError(error);
    }

    return user;
  }

  async remove(id: string) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new Error(`No se encontró un usuario con el ID: ${id}`);
    }
  }

  async removeAllUsers() {
    const queryBuilder = this.userRepository.createQueryBuilder('users');

    try {
      return await queryBuilder.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptionError(error);
    }
  }

  async checkStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDBExceptionError(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
