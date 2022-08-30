import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.authguard';

@Controller()
export class AuthController {
    constructor(private authService:AuthService){}
    
    // @UseGuards(AuthGuard("local"))
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    public login( @Req() req:Request, @Body("username")userName:string, @Body("password") password:string){
        return {token: this.authService.generateToken({userName: req.user['userName'],role:req.user['role']})}
    }
}
