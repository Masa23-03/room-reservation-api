import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthResponseDto, LoginDTO, RegisterDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { email } from 'zod';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  //   - `register`
  async register(payLoad: RegisterDto): Promise<AuthResponseDto> {
    //hash password
    const hashedPassword = await this.hashPassword(payLoad.password);

    //create user
    const createdUser = await this.userService.create({
      name: payLoad.name,
      email: payLoad.email,
      role: payLoad.role ?? Role.GUEST,
      password: hashedPassword,
    });

    //create token
    const token = await this.generateJwtToken(createdUser.id, createdUser.role);

    //return auth response: token + user
    return {
      token: token,
      user: createdUser,
    };
  }
  // - `login`
  async login(payLoad: LoginDTO): Promise<AuthResponseDto> {
    //find user
    const foundedUser = await this.userService.findByEmail(payLoad.email);
    if (!foundedUser) throw new UnauthorizedException('Invalid credentials');
    if (foundedUser.isDeleted)
      throw new UnauthorizedException('Invalid credentials');

    //verify argon , and throw error if argon didn't match
    const verifiedPassword = await this.verifyPassword(
      payLoad.password,
      foundedUser.password,
    );
    if (!verifiedPassword)
      throw new UnauthorizedException('Invalid credentials');
    //create token
    const token = await this.generateJwtToken(
      String(foundedUser.id),
      foundedUser.role,
    );

    //return auth response: token + user
    return {
      user: this.userService.mapUserWithoutPasswordAndCastBigInt(foundedUser),
      token,
    };
  }
  // - `revalidate`
  validate(payLoad: AuthResponseDto['user']) {
    const token = this.generateJwtToken(String(payLoad.id), payLoad.role);
    return {
      user: payLoad,
      token,
    };
  }

  //hash password method
  private hashPassword(password: string) {
    return argon2.hash(password);
  }
  //generate jwt token method
  private generateJwtToken(userId: string, role: Role) {
    return this.jwtService.sign(
      { sub: userId, role: role },
      { expiresIn: '30d' },
    );
  }
  //verify password
  private verifyPassword(password: string, hashedPassword: string) {
    return argon2.verify(hashedPassword, password);
  }
}
