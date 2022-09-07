import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PAGESIZE } from "../common/constants";
import { DonorService } from "../donor/donor.service";
import { CreateRequestDTO } from "./dto/create-request.dto";
import { UpdateRequestDTO } from "./dto/update-request.dto";
import { MAXDONATIONUNIT, REQUESTSTATUS } from "./request.constants";
import { RequestDoc } from "./schema/request.schema";
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from "../common/email-notifier/email-notifier.service";

@Injectable()
export class RequestService{

    constructor(@InjectModel('Request') private requestModel:Model<RequestDoc>,private donorService:DonorService,private mailerService:MailerService,private emailService:EmailService ){}

    public async createRequest (userId:string,request:CreateRequestDTO){
        let newRequest = new this.requestModel({
            ...request,
            userRef:userId,
            foundBloodUnit:0,
            status:REQUESTSTATUS[0],
            date:new Date(),
            message:request?.message? request.message:'',
            remainingBloodUnit:request.requiredBloodUnit,
            foundDonors:[]
        })
        let result =  await (await newRequest.save()).populate('userRef')
        let matchingDonors = await this.donorService.getDonorByQueryParametrs({status:'active',bloodType:request.bloodType,address:request.address})
        if(matchingDonors.length>0){
            let recipientEmails = []
            for(let donor of matchingDonors){
                if(donor.userRef.email){
                    recipientEmails.push(donor.userRef.email)
                }
            }
            // console.log(recipientEmails)
            if(recipientEmails.length>0){
                this.emailService.sendEmail(`${result.userRef.userName} needs your help, check the donation portal at https://www.google.com to donate your blood and save life `,"Some one you can save is on the way",`<div style = 'font-family:sans-serif;padding:5em 1em;border-radius:1em;box-shadow: 2px 2px 10px black'> <h4 style='text-transform:capitalize;display:inline'>${result.userRef.userName}</h4> needs your help, check the donation portal <a href = 'https://www.google.com' style='text-decoration:none;background:blue;color:white;border-radius:1em;padding:0.2em 1em;margin:0.1em 0.2em' >here </a> to donate your blood and save life </div> `,recipientEmails)
            }
        }
        // console.log(matchingDonors)
        return result
    }

    public async getRequestById (requestId:string){
        let foundRequest = await this.requestModel.findOne({_id:requestId})
        if(foundRequest){
            return foundRequest
        }else{
            return null
        }
    }

    public async getRequestsByUserId (userId:string){
        let results = await this.requestModel.find({userRef:userId})
        return results
    }

    public async getRequestByAddressBloodTypeAndStatus(addresses:string[],bloodType:string,status:string[],pageNumber:number){
        return await this.requestModel.find({address:{$in:[...addresses]},bloodType:bloodType,status:{$in:[...status]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE)
    }
    public async getRequestByBloodTypeAndStatus(bloodType:string,status:string[],pageNumber:number){
       return await this.requestModel.find({bloodType:bloodType,status:{$in:[...status]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE)
    }
    public async getRequestByAddressAndStatus(address:string[],status:string[],pageNumber:number){
        return await this.requestModel.find({address:{$in:[...address]},status:{$in:[...status]}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE)
    }
    public async getRequestByStatus(status:string[],pageNumber:number){
        return await this.requestModel.find({status:{$in:status}}).skip((pageNumber*PAGESIZE)-PAGESIZE).limit(PAGESIZE)
    }
    async getRequestByQueryParametrs(parameters:any){
        let result = []
        let pageNumber = 1
        let status = [...REQUESTSTATUS]
        // this.emailService.sendEmail('this is the text fild on the message','to kill you','<h2>hey due</h2><p>paragraph dude!!</p>',['abe@gmail.com','tewo@gmail.com'])
        if(parameters.status){
            if(typeof parameters.status === 'string'){
                if(parameters.status !=='all'){
                    status=[parameters.status]
                }
            }else if(typeof parameters.status === 'object'){
                status= [...parameters.status]
            }
        }

        // handling pagination 
        if(parameters.pageNumber){
            let temp = parseInt(parameters.pageNumber)
            if(!isNaN(temp)){
                pageNumber=temp
            }
        }
       
        // handling address and blood type of request
        if(parameters.bloodType && parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getRequestByAddressBloodTypeAndStatus(parameters.address,parameters.bloodType,status,pageNumber)
            }else if(typeof parameters.address == 'string'){
                result = await this.getRequestByAddressBloodTypeAndStatus([parameters.address],parameters.bloodType,status,pageNumber)
            }else{
                result = await this.getRequestByBloodTypeAndStatus(parameters.bloodType,status,pageNumber)
            }
        }else if(parameters.bloodType){
            result = await this.getRequestByBloodTypeAndStatus(parameters.bloodType,status,pageNumber)
        }else if(parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getRequestByAddressAndStatus(parameters.address,status,pageNumber)
            }else if(typeof parameters.address == 'string'){
                result = await this.getRequestByAddressAndStatus([parameters.address],status,pageNumber)  
        }
        }else{
            result = await this.getRequestByStatus(status,pageNumber)
        }

        return result
     }

    public async addDonorForRequest(requestId:string,donorId:string){
        let existingRequest = await this.requestModel.findOne({_id:requestId})
        let updated = ''
        if(existingRequest){
            if(existingRequest.remainingBloodUnit===0){
                return null
            }else{
               if(existingRequest.remainingBloodUnit===1){
                    updated=  await this.requestModel.findOneAndUpdate({_id:requestId},{remainingBloodUnit:existingRequest.remainingBloodUnit-MAXDONATIONUNIT,foundBloodUnit:existingRequest.foundBloodUnit+MAXDONATIONUNIT,status:REQUESTSTATUS[2],foundDonors:[...existingRequest.foundDonors,donorId]},{runValidators:true,new:true})
                }
                else{
                    updated = await this.requestModel.findOneAndUpdate({_id:requestId},{remainingBloodUnit:existingRequest.remainingBloodUnit-MAXDONATIONUNIT,foundBloodUnit:existingRequest.foundBloodUnit+MAXDONATIONUNIT,status:REQUESTSTATUS[1],foundDonors:[...existingRequest.foundDonors,donorId]},{runValidators:true,new:true})
                } 
                await this.donorService.addRequestRef(donorId,requestId)
                return updated

            } 
        }else{
            return null
        }
    }

    public async updateRequest (requestId:string,request:UpdateRequestDTO){
        let existingRequest = await this.requestModel.findOne({_id:requestId})
        let updatedRequest = await this.requestModel.findOneAndUpdate(
            {_id:requestId},
            {
            ...request,
            remainingBloodUnit:request.requiredBloodUnit-existingRequest.foundBloodUnit,
            },
            {runValidators:true,new:true})
        return updatedRequest
    }
    public async deleteRequest (requestId:string){
        return await this.requestModel.findOneAndDelete({_id:requestId})
    }
}