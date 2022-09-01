import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRequestDTO } from "./dto/create-request.dto";
import { REQUESTSTATUS } from "./request.constants";
import { RequestDoc } from "./schema/request.schema";

@Injectable()
export class RequestService{

    constructor(@InjectModel('Request') private requestModel:Model<RequestDoc> ){}

    public async createRequest (userId:string,request:CreateRequestDTO){
        let newRequest = new this.requestModel({
            ...request,
            userRef:userId,
            foundBloodUnit:0,
            status:REQUESTSTATUS[0],
            remainingBloodUnit:request.requiredBloodUnit,
            FoundDonors:[]
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

    public async updateRequest (requestId:string,request:CreateRequestDTO){
        let existingRequest = await this.requestModel.findOne({_id:requestId})
        let updatedRequest = await this.requestModel.findOneAndUpdate(
            {
                _id:requestId
            },
            {
            ...request,
            status:REQUESTSTATUS[0],
            remainingBloodUnit:request.requiredBloodUnit-existingRequest.foundBloodUnit,
        },{runValidators:true,new:true})
        return updatedRequest
    }
    public async deleteRequest (requestId:string){
        return await this.requestModel.findOneAndDelete({_id:requestId})
    }
}