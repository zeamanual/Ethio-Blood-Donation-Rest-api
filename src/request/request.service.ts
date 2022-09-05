import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DonorService } from "../donor/donor.service";
import { CreateRequestDTO } from "./dto/create-request.dto";
import { UpdateRequestDTO } from "./dto/update-request.dto";
import { MAXDONATIONUNIT, REQUESTSTATUS } from "./request.constants";
import { RequestDoc } from "./schema/request.schema";

@Injectable()
export class RequestService{

    constructor(@InjectModel('Request') private requestModel:Model<RequestDoc>,private donorService:DonorService ){}

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
        let result =  await newRequest.save()
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

    public async getRequestByAddressAndBloodType(addresses:string[],bloodType:string){
        return await this.requestModel.find({address:{$in:[...addresses]},bloodType:bloodType})
    }
    public async getRequestByBloodType(bloodType:string){
       return await this.requestModel.find({bloodType:bloodType})
    }
    public async getRequestByAddress(address:string[]){
        return await this.requestModel.find({address:{$in:[...address]}})
    }

    async getRequestByQueryParametrs(parameters:any){
        let result = []
        if(parameters.bloodType && parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getRequestByAddressAndBloodType(parameters.address,parameters.bloodType)
            }else if(typeof parameters.address == 'string'){
                result = await this.getRequestByAddressAndBloodType([parameters.address],parameters.bloodType)
            }else{
                result = await this.getRequestByBloodType(parameters.bloodType)
            }
        }else if(parameters.bloodType){
            result = await this.getRequestByBloodType(parameters.bloodType)
        }else if(parameters.address){
            if( typeof parameters.address == 'object'){
                result = await this.getRequestByAddress(parameters.address)
            }else if(typeof parameters.address == 'string'){
                result = await this.getRequestByAddress([parameters.address])  
        }
        }else{
            return await this.requestModel.find({})
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