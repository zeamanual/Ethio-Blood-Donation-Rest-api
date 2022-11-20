import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt.authguard";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { UserService } from "./user.service";

@Controller('user')
export class UserController {
    constructor(private userService:UserService){}

    @UseGuards(JwtAuthGuard)
    @Get()
    public async getUser(@Req() req:Request){
        let found = await this.userService.getUser(req.user["userName"])
        if(found){
            return {userName:found.userName,email:found.email,phoneNumber:found.phoneNumber,bloodType:found.bloodType,age:found.age,address:found.address,gender:found.gender}
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
    @Put()
    @HttpCode(200)
    public async updateProfile(@Body() user:UpdateUserDTO,@Req() req:Request){

        let existingUserByUserName = await this.userService.getUser(user.userName)
        let existingUserById = await this.userService.getById(req.user['_id'])

        if(user.userName===existingUserById.userName || !existingUserByUserName){
            return await this.userService.updateProfile(req.user['_id'],user)
        }else{
            throw new HttpException("User name already taken. Try another one",400)
        }
    }
}