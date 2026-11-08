import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedUser, RequestWithUser } from "./jwt-auth.guard";

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;
    if (!authorization) return true;

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Header Authorization không hợp lệ");
    }

    try {
      request.user = await this.jwt.verifyAsync<AuthenticatedUser>(token);
      return true;
    } catch {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
    }
  }
}
