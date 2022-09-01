import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService{
    constructor(private userService:UserService,private jwtService:JwtService){}
 
    public async validateUser(username:string,password:string){
       
        let userFound = await this.userService.getUser(username)
        if(userFound){
            if(await compare(password,userFound.password)){
                return userFound
            }else{
                throw new HttpException('Password Incorrect',HttpStatus.FORBIDDEN)
            }
        }else{
            throw new HttpException('User Name Not Found',HttpStatus.FORBIDDEN)
        }
    }
    public generateToken(payload:any){
            return this.jwtService.sign(payload,{secret:process.env.TOKEN_SECRET,expiresIn:'3000m'})
    }

}