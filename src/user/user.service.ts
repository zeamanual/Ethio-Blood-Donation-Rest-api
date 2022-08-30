import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt'
import { CreateUserDTO } from "./dto/create-user.dto";
import { UserDoc } from "./schema/user.schma";


@Injectable()
export class UserService {

    constructor( @InjectModel('User') private userModel:Model<UserDoc>){}
    

    public greeting(){
        let user= new this.userModel({
            userName:'zeamanual',

        })
        return user.save()
    }
    public async signUp(user:CreateUserDTO){
        let foundUser = await this.userModel.find({userName:user.userName})
        if(foundUser.length==0){
            let salt = await bcrypt.genSalt(10)
            let hashedPassword = await bcrypt.hash(user.password,salt)
            let newUser= new this.userModel({...user,password:hashedPassword ,role:'USER'})
            let createdUser = await newUser.save()
            return createdUser
        }
        else{
            throw new HttpException("User name already taken",HttpStatus.BAD_REQUEST)
        }
    }

    public async getUser(userName:string){
        let foundUser = await this.userModel.find({userName})
        if(foundUser.length==1){
            return foundUser[0]
        }
        else{
            return null
        }
    }

}