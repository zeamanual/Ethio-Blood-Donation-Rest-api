import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.authguard';

@Module({
    imports:[UserModule,PassportModule],
    providers:[AuthService,LocalStrategy,JwtService,JwtStrategy,RolesGuard],
    controllers: [AuthController]
})
export class AuthModule {}
