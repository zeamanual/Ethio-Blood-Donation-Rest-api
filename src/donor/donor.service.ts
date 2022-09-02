import { forwardRef, HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserService } from "../user/user.service";
import { CreateDonorDTO } from "./dto/create-donor.dto";
import { UpdateDonorDTO } from "./dto/update-donor.dto";
import { DonorDoc } from "./schema/donor.schema";


@Injectable()
export class DonorService {
    constructor( @InjectModel("Donor") private donorModel:Model<DonorDoc>,@Inject(forwardRef(()=>UserService)) private userService:UserService){}
    
    async createDonor(userId:string,donorDetail:CreateDonorDTO){
        let user = await this.userService.getById(userId)
        let existingDonor = await this.donorModel.findOne({userRef:user._id})
        if(existingDonor) throw new HttpException({msg:"Donor Already Created"},400)
       
        if(user){
            let newDonor =  new this.donorModel({
                userRef:user['_id'],
                address:donorDetail.address,
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

    async getDonorByUserId(userid:string){
        let donor= await this.donorModel.findOne({userRef:userid})
        return donor
    }

    // used by the user module for a cascading update when user profile is updated
    async updateDonorStates(userId){
        let user = await this.userService.getById(userId)
        await this.donorModel.findOneAndUpdate({userRef:userId},{bloodType:user['bloodType']})
    }
    async updateDonor(userId:string,donor:UpdateDonorDTO){
        return await this.donorModel.findOneAndUpdate({userRef:userId},{address:donor.address,isActive:donor.active},{runValidators:true,new:true})
    }

}