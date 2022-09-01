import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt'
import { CreateUserDTO } from "./dto/create-user.dto";
import { UserDoc } from "./schema/user.schma";
import { DonorService } from "../donor/donor.service";


@Injectable()
export class UserService {

    constructor( @InjectModel('User') private userModel:Model<UserDoc>, @Inject(forwardRef(()=>DonorService)) private donorService:DonorService){}
    
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
    public async getById(userId:string){
        let foundUser = await this.userModel.find({_id:userId})
        if(foundUser.length==1){
            return foundUser[0]
        }
        else{
            return null
        }
    }
    public async addRole(userName:string,role:string){

        let existingUser = await this.userModel.findOne({userName:userName})
        return await this.userModel.findOneAndUpdate({userName:userName},{role:[...existingUser.role,role]},{runValidators:true,new:true})
    }

    public async updateProfile(userId,user:CreateUserDTO){
        let salt = await bcrypt.genSalt(10)
         await this.userModel.findOneAndUpdate({_id:userId},{...user,password:await bcrypt.hash(user.password,salt)},{runValidators:true,new:true})
         await this.donorService.updateDonorStates(userId)
         return this.userModel.findOne({_id:userId})
    }

}