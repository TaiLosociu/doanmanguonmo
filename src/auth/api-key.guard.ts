import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey =
      (request.headers["x-api-key"] as string) ||
      (request.query["api_key"] as string);

    const validKey =
      process.env.API_KEY || "SAN_NHA_BMT_SECRET_API_KEY_2026";

    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException(
        "API Key không hợp lệ hoặc thiếu header x-api-key",
      );
    }

    return true;
  }
}

