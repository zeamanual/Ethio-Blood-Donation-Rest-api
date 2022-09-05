import { Body, Controller, Delete, Get, HttpCode, HttpException, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { DonorService } from "../donor/donor.service";
import { JwtAuthGuard } from "../auth/jwt.authguard";
import { CreateRequestDTO } from "./dto/create-request.dto";
import { UpdateRequestDTO } from "./dto/update-request.dto";
import { RequestService } from "./request.service";
import { Address } from "src/user/dto/address";

@UseGuards(JwtAuthGuard)
@Controller('request')
export class RequestController{
    constructor(private requestService:RequestService,private donorService:DonorService){}

    @Get()
    public async getRequestByUserId(@Req() req:Request){
        let result = await this.requestService.getRequestsByUserId(req.user['_id'])
        if(result.length>0){
            return result
        }else{
            throw new HttpException("No request owned by user",404)
        }
    }
    @Get('filter')
    public async getRequestByAddressAndOrBloodType(@Query("address") address:string,@Query("bloodType") bloodType:string){
        console.log('address',address,'bloodType',bloodType)
        let matchingRequests = []
        if(bloodType){
            if(typeof address ==='object' ){
                matchingRequests = await this.requestService.getRequestByAddressAndBloodType(address,bloodType)
            }else if(typeof address ==='string'){
                matchingRequests = await this.requestService.getRequestByAddressAndBloodType([address],bloodType)
            }

        }else{
            if(typeof address ==='object' ){
                matchingRequests = await this.requestService.getRequestByAddress(address)
                console.log('address is list')
            }else if(typeof address ==='string'){
                matchingRequests = await this.requestService.getRequestByAddress([address])
            }
        }
        if(matchingRequests.length>0){
            return matchingRequests 
        }else{
            throw new HttpException("No request with specified filter found",404)
        }
    }
    @Get('/:requestId')
    public async getRequestById(@Param("requestId") requestId:string){
        let result = await this.requestService.getRequestById(requestId)
        if(result){
            return result
        }else{
            throw new HttpException("Request can not be found",404)
        }
    }

    @Post()
    public async createRequest(@Req() req:Request,@Body() request:CreateRequestDTO){
        let result = await this.requestService.createRequest(req.user['_id'],request)
        return result
    }

    @Put('/:requestId/donate')
    public async addDonorForRequest(@Req() req:Request,@Param("requestId") requestId:string ){
        let donor = await this.donorService.getDonorByUserId(req.user['_id'])
        let request = await this.requestService.getRequestById(requestId)
        
        if(donor && donor.isElligibleToDonate){
            if(donor.bloodType===request.bloodType){
                let updated = await this.requestService.addDonorForRequest(requestId,donor['_id'])
                if(!updated){
                    throw new HttpException("Request already fulfilled",404)
                }
            }else{
                throw new HttpException("Blood group doesn't match",400)
            }
        }else{
            throw new HttpException("User not a donor or User not elligible to donate",403)
        }
    }

    @Put("/:requestId")
    @HttpCode(200)
    public async updateRequest(@Param('requestId') requestId:string, @Body() request:UpdateRequestDTO, @Req() req:Request){
        let existingRequest = await this.requestService.getRequestById(requestId)
        if(existingRequest){
            if(existingRequest.userRef == req.user['_id']){
                return await this.requestService.updateRequest(requestId,request)
            }else{
                throw new HttpException("It is not a request you have created",403)
            }
        }else{
            throw new HttpException("Request not found",404)
        }
    }

    @Delete('/:requestId')
    @HttpCode(200)
    public async deleteRequest(@Req() req:Request,@Param("requestId") requestId:string){
        let existingRequest = await this.requestService.getRequestById(requestId)
        if(existingRequest){
            if(existingRequest.userRef == req.user['_id']){
                await this.requestService.deleteRequest(requestId)
            }else{
                throw new HttpException("It is not a request you have created",403)
            }
        }else{
            throw new HttpException("Request not found",404)
        }
    }
}