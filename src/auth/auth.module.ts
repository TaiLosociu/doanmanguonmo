import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";
import { ApiKeyGuard } from "./api-key.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") ?? "super-secret-key-change-in-production",
        signOptions: { expiresIn: "8h" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, JwtAuthGuard, RolesGuard, OptionalJwtAuthGuard, ApiKeyGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard, OptionalJwtAuthGuard, ApiKeyGuard],
})
export class AuthModule {}

