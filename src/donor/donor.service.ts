import { forwardRef, HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { Model } from "mongoose";
import { PAGESIZE } from "../common/constants";
import { UserService } from "../user/user.service";
import { CreateDonorDTO } from "./dto/create-donor.dto";
import { UpdateDonorDTO } from "./dto/update-donor.dto";
import { DonorDoc } from "./schema/donor.schema";


@Injectable()
export class DonorService {
    constructor( @InjectModel("Donor") private donorModel:Model<DonorDoc>,@Inject(forwardRef(()=>UserService)) private userService:UserService){}
    
    public async createDonor(userId:string,donorDetail:CreateDonorDTO){
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

    public async getDonorByUserId(userid:string){
        let donor= await this.donorModel.findOne({userRef:userid})
        return donor
    }

    public async addRequestRef(donorId:string,requestId:string){
        let existingDonorData = await this.donorModel.findOne({_id:donorId})
        if(existingDonorData){
            let updated = await this.donorModel.findOneAndUpdate({_id:donorId},{donatedFor:[...existingDonorData.donatedFor,requestId],isElligibleToDonate:false,lastDonationDate:new Date()})
        }else{
            throw new HttpException("User not a donor",404)
        }
     }
    
     public async getDonorsByAddressAndStatus(address:string[],activeStatus:boolean,pageNumber:number){
        return await this.donorModel.find({address:{$in:address},isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE)
     }
     
     public async getDonorByBloodTypeAndStatus(bloodType:string,activeStatus:boolean,pageNumber:number){
        return await this.donorModel.find({bloodType,isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE)
     }

     public async getDonorByBloodTypeAddressAndStatus(address:string[],bloodType:string,activeStatus:boolean,pageNumber:number){
        return await this.donorModel.find({address:{$in:address},bloodType,isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE)
     }

     public async getDonorsByStatus(activeStatus:boolean,pageNumber:number){
        return await this.donorModel.find({isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE)
     }

     public async getDonorByQueryParametrs(parameters:any){
        let result = []
        let activeStatus = false
        let pageNumber = 1

        // handling status of donor
        if(parameters.status){
                if(parameters.status ==='all'){
                    activeStatus=false
                }else if(parameters.status === 'active'){
                    activeStatus = true
                }
        }

        // handling pagination 
        if(parameters.pageNumber){
            let temp = parseInt(parameters.pageNumber)
            if(!isNaN(temp)){
                pageNumber=temp
            }
        }
       
        // handling address and blood type of donor
        if(parameters.bloodType && parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getDonorByBloodTypeAddressAndStatus(parameters.address,parameters.bloodType,activeStatus,pageNumber)
            }else if(typeof parameters.address == 'string'){
                result = await this.getDonorByBloodTypeAddressAndStatus([parameters.address],parameters.bloodType,activeStatus,pageNumber)
            }else{
                result = await this.getDonorByBloodTypeAndStatus(parameters.bloodType,activeStatus,pageNumber)
            }
        }else if(parameters.bloodType){
            result = await this.getDonorByBloodTypeAndStatus(parameters.bloodType,activeStatus,pageNumber)
        }else if(parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getDonorsByAddressAndStatus(parameters.address,activeStatus,pageNumber)
            }else if(typeof parameters.address == 'string'){
                result = await this.getDonorsByAddressAndStatus([parameters.address],activeStatus,pageNumber)  
        }
        }else{
            result = await this.getDonorsByStatus(activeStatus,pageNumber)
        }
        return result
     }

    // used by the user module for a cascading update when user profile is updated
    public async updateDonorStates(userId:string){
        let user = await this.userService.getById(userId)
        await this.donorModel.findOneAndUpdate({userRef:userId},{bloodType:user['bloodType']})
    }
    public async updateDonor(userId:string,donor:UpdateDonorDTO){
        return await this.donorModel.findOneAndUpdate({userRef:userId},{address:donor.address,isActive:donor.active},{runValidators:true,new:true})
    }

    
    @Cron("0 0 0 * * *")
    public async updateAllDonorsEligibilityState(){
        console.log("Donor Eligibility state update process initialised on: ",new Date())
        let allDonors = await this.donorModel.find({}).populate("userRef")
        let donorsCount = allDonors.length
        let index = 0
        while(index<donorsCount){
            let currentDonor = allDonors[index]
            if(currentDonor.lastDonationDate){
                if(this.givenDaysPassedAfterGivenDate(currentDonor.lastDonationDate,75)){
                    await this.donorModel.findOneAndUpdate({_id:currentDonor._id},{isElligibleToDonate:true})
                }
            }
            index++
        }
    }

    public givenDaysPassedAfterGivenDate(targetDate:Date,DaysPassed:number):boolean{
        let currentDate = new Date()
        let timeDiffrenceInDays = (currentDate.getTime()-targetDate.getTime())/(1000*60*60*24)
        console.log(timeDiffrenceInDays)
        if(timeDiffrenceInDays>DaysPassed){
            return true
        }else{
            return false
        }
    }

}