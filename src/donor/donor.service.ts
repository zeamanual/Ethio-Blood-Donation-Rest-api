import { forwardRef, HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserService } from "../user/user.service";
import { DonorDoc } from "./schema/donor.schema";


@Injectable()
export class DonorService {
    constructor( @InjectModel("Donor") private donorModel:Model<DonorDoc>,@Inject(forwardRef(()=>UserService)) private userService:UserService){}
 
    async createDonor(userId:string){
        let user = await this.userService.getById(userId)
        let existingDonor = await this.donorModel.findOne({userRef:user._id})
        if(existingDonor) throw new HttpException({msg:"Donor Already Created"},400)
       
        if(user){
            let newDonor =  new this.donorModel({
                userRef:user['_id'],
                address:user['address'],
                bloodType:user['bloodType'],
                lastDonationDate:null,
                isElligibleToDonate:true,
                isActive:true,
                donatedFor:[]            
            })
            newDonor = await newDonor.save()
            await this.userService.addRole(user['userName'],'DONOR')
            return true
        }else{
            return false
        }
    }
    async disableDonor(userId){
        return await this.donorModel.findOneAndUpdate({userRef:userId},{isActive:false},{runValidators:true,new:true})
    }
    async enableDonor(userId){
        return await this.donorModel.findOneAndUpdate({userRef:userId},{isActive:true},{runValidators:true,new:true})
    }

    async updateDonorStates(userId){
        let user = await this.userService.getById(userId)
        await this.donorModel.findOneAndUpdate({userRef:userId},{address:user['address'],bloodType:user['bloodType']})
    }

}