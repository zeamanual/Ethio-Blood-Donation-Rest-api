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
    @Post('/user/login')
    public login( @Req() req:Request, @Body("username")userName:string, @Body("password") password:string){
        return {userId:req.user['_id'],address:req.user['address'],bloodType:req.user['bloodType'],roles:req.user['role'],userName:req.user['userName'],token: this.authService.generateToken({userName: req.user['userName'],_id:req.user['_id'],role:req.user['role']})}
    }
}
