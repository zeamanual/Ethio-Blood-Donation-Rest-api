import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt.authguard";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UserService } from "./user.service";

@Controller()
export class UserController {
    constructor(private userService:UserService){}

    @Get("/test/:userName")
    public async getUser(@Param("userName") userName:string){
        let found = await this.userService.getUser(userName)
        if(found){
            return {userName:found.userName,email:found.email,phoneNumber:found.phoneNumber,bloodType:found.bloodType,age:found.age,address:found.address}
        }
        else{
            throw new HttpException("User not found",HttpStatus.NOT_FOUND)
        }
    }

    @Post('/sign-up')
    public async signUp( @Body() user:CreateUserDTO){
        return this.userService.signUp(user)
    }

    @UseGuards(JwtAuthGuard)
    @Get("/secured/s")
    public getSecured(@Req() req:Request){
        return req.user
    }
}