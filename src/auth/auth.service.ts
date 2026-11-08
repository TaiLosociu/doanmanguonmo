import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { RegisterDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: email }],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: "Bearer",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async register(input: RegisterDto) {
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: input.phone },
    });
    if (existingPhone) {
      throw new ConflictException("Số điện thoại này đã được đăng ký");
    }

    if (input.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingEmail) {
        throw new ConflictException("Email này đã được sử dụng");
      }
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        passwordHash,
        role: Role.CUSTOMER,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: "Bearer",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException("Người dùng không tồn tại");
    }
    return user;
  }

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
