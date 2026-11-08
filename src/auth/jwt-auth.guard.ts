import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Role } from "@prisma/client";

export interface AuthenticatedUser {
  sub: number;
  email: string | null;
  role: Role;
  fullName: string;
}

export type RequestWithUser = Request & { user?: AuthenticatedUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException("Yêu cầu cung cấp Bearer token xác thực");
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Header Authorization không đúng định dạng Bearer");
    }

    try {
      const payload = await this.jwt.verifyAsync<AuthenticatedUser>(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
    }
  }
}
