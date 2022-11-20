import { forwardRef, HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { Model } from "mongoose";
import { EmailService } from "../common/email-notifier/email-notifier.service";
import { PAGESIZE } from "../common/constants";
import { UserService } from "../user/user.service";
import { CreateDonorDTO } from "./dto/create-donor.dto";
import { UpdateDonorDTO } from "./dto/update-donor.dto";
import { DonorDoc } from "./schema/donor.schema";


@Injectable()
export class DonorService {
    constructor( @InjectModel("Donor") private donorModel:Model<DonorDoc>,@Inject(forwardRef(()=>UserService)) private userService:UserService,private emailService:EmailService){}
    
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

    public async getDonorById(donorId:string){
        let donor= await this.donorModel.findOne({_id:donorId})
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
    
     public async getDonorsByAddressAndStatus(address:string[],activeStatus:boolean,pageNumber:number,ignorePageNumber:boolean = false){
        if(ignorePageNumber){
            return await this.donorModel.find({address:{$in:address},isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).populate("userRef")
        }
        return await this.donorModel.find({address:{$in:address},isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE).populate("userRef")
     }
     
     public async getDonorByBloodTypeAndStatus(bloodType:string,activeStatus:boolean,pageNumber:number,ignorePageNumber:boolean = false){
        if(ignorePageNumber){
            return await this.donorModel.find({bloodType,isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).populate("userRef")
        }
        return await this.donorModel.find({bloodType,isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE).populate("userRef")
     }

     public async getDonorByBloodTypeAddressAndStatus(address:string[],bloodType:string,activeStatus:boolean,pageNumber:number,ignorePageNumber:boolean = false){
        if(ignorePageNumber){
            return await this.donorModel.find({address:{$in:address},bloodType,isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).populate("userRef")  
        }
        return await this.donorModel.find({address:{$in:address},bloodType,isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE).populate("userRef")
     }

     public async getDonorsByStatus(activeStatus:boolean,pageNumber:number,ignorePageNumber:boolean = false){
        if(ignorePageNumber){
            return await this.donorModel.find({isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).populate("userRef")  
        }
        return await this.donorModel.find({isActive:activeStatus?activeStatus:{$in:[true,false]},isElligibleToDonate:activeStatus?activeStatus:{$in:[true,false]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE).populate("userRef")
     }

     public async getDonorByQueryParametrs(parameters:any){
        let result = []
        let activeStatus = false
        let pageNumber = 1
        let ignorePageNumber = false

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
       // handle ignore page number
       if(parameters.ignorePageNumber){
        if(parameters.ignorePageNumber==='true'){
            ignorePageNumber=true
        }
       }
        // handling address and blood type of donor
        if(parameters.bloodType && parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getDonorByBloodTypeAddressAndStatus(parameters.address,parameters.bloodType,activeStatus,pageNumber,ignorePageNumber)
            }else if(typeof parameters.address == 'string'){
                result = await this.getDonorByBloodTypeAddressAndStatus([parameters.address],parameters.bloodType,activeStatus,pageNumber,ignorePageNumber)
            }else{
                result = await this.getDonorByBloodTypeAndStatus(parameters.bloodType,activeStatus,pageNumber,ignorePageNumber)
            }
        }else if(parameters.bloodType){
            result = await this.getDonorByBloodTypeAndStatus(parameters.bloodType,activeStatus,pageNumber,ignorePageNumber)
        }else if(parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getDonorsByAddressAndStatus(parameters.address,activeStatus,pageNumber,ignorePageNumber)
            }else if(typeof parameters.address == 'string'){
                result = await this.getDonorsByAddressAndStatus([parameters.address],activeStatus,pageNumber,ignorePageNumber)  
        }
        }else{
            result = await this.getDonorsByStatus(activeStatus,pageNumber,ignorePageNumber)
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

    public async cancelDonation(donorId:string,requestId:string){
        let foundDonor = await this.donorModel.findOne({_id:donorId})
        await this.donorModel.findOneAndUpdate({_id:donorId},{isElligibleToDonate:true,donatedFor:foundDonor.donatedFor.filter(req=>req['_id'].toString()!==requestId.toString())})
    }
    
    @Cron("0 0 0 * * *")
    // @Cron("*/4 * * * * *")
    public async updateAllDonorsEligibilityState(){
        console.log("Donor Eligibility state update process initialised on: ",new Date())
        let allDonors = await this.donorModel.find({}).populate("userRef")
        let donorsCount = allDonors.length
        let index = 0
        let notificationRecipientEmails=[]
        while(index<donorsCount){
            let currentDonor = allDonors[index]
            if(currentDonor.lastDonationDate){
                if(this.givenDaysPassedAfterGivenDate(currentDonor.lastDonationDate,1)){
                   let updated =  await this.donorModel.findOneAndUpdate({_id:currentDonor._id},{isElligibleToDonate:true},{runValidators:true,new:true}).populate('userRef')
                   if(updated.userRef.email){
                    notificationRecipientEmails.push(updated.userRef.email)
                   }
                }
            }
            index++
        }
        if(notificationRecipientEmails.length>0){
            this.emailService.sendEmail(`Hi dear Donor, we hope you are doing well. starting from today you can start donating you'er blood as 3 months have passed since your last donation`
            ,'Recovery Time Completed. You can donate now',
            `<div style = ' display:flex;flex-direction:column;align-items:center; font-family:sans-serif;padding:5em 2em;border-radius:1em;box-shadow: 2px 2px 10px black'> <img style = 'width:50vw;object-fit:cover' src = 'https://www.bagmo.in/wp-content/uploads/2022/03/volunteers-woman-man-donating-blood-blood-donor-charity_262189-61.webp' /> <p style = 'text-align:justify'> Hi dear Donor, we hope you are doing well. starting from today you can start donating you'er blood as 3 months have passed since your last donation</p> </div>`,
            notificationRecipientEmails)
        }
    }

    public givenDaysPassedAfterGivenDate(targetDate:Date,DaysPassed:number):boolean{
        let currentDate = new Date()
        let timeDiffrenceInDays = (currentDate.getTime()-targetDate.getTime())/(1000*60*60*24)
        // console.log(timeDiffrenceInDays)
        if(timeDiffrenceInDays>DaysPassed){
            return true
        }else{
            return false
        }
    }

}