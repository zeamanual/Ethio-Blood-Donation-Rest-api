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

    async addRequestRef(donorId:string,requestId:string){
        let existingDonorData = await this.donorModel.findOne({_id:donorId})
        if(existingDonorData){
            let updated = await this.donorModel.findOneAndUpdate({_id:donorId},{donatedFor:[...existingDonorData.donatedFor,requestId],isElligibleToDonate:false,lastDonationDate:new Date()})
        }else{
            throw new HttpException("User not a donor",404)
        }
     }
    
     async getDonorsByAddress(address:string[]){
        return await this.donorModel.find({address:{$in:address}})
     }
     
     async getDonorByBloodType(bloodType:string){
        return await this.donorModel.find({bloodType})
     }

     async getDonorByBloodTypeAndAddress(address:string[],bloodType:string){
        return await this.donorModel.find({address:{$in:address},bloodType})
     }

     async getDonorByQueryParametrs(parameters:any){
        let result = []
        if(parameters.bloodType && parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getDonorByBloodTypeAndAddress(parameters.address,parameters.bloodType)
            }else if(typeof parameters.address == 'string'){
                result = await this.getDonorByBloodTypeAndAddress([parameters.address],parameters.bloodType)
            }else{
                result = await this.getDonorByBloodType(parameters.bloodType)
            }
        }else if(parameters.bloodType){
            result = await this.getDonorByBloodType(parameters.bloodType)
        }else if(parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getDonorsByAddress(parameters.address)
            }else if(typeof parameters.address == 'string'){
                result = await this.getDonorsByAddress([parameters.address])  
        }
        }else{
            return await this.donorModel.find({})
        }
        return result
     }
    // used by the user module for a cascading update when user profile is updated
    async updateDonorStates(userId:string){
        let user = await this.userService.getById(userId)
        await this.donorModel.findOneAndUpdate({userRef:userId},{bloodType:user['bloodType']})
    }
    async updateDonor(userId:string,donor:UpdateDonorDTO){
        return await this.donorModel.findOneAndUpdate({userRef:userId},{address:donor.address,isActive:donor.active},{runValidators:true,new:true})
    }

}