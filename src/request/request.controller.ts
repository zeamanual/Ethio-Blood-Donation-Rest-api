import { Body, Controller, Delete, Get, HttpCode, HttpException, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt.authguard";
import { CreateRequestDTO } from "./dto/create-request.dto";
import { UpdateRequestDTO } from "./dto/update-request.dto";
import { RequestService } from "./request.service";

@UseGuards(JwtAuthGuard)
@Controller('request')
export class RequestController{
    constructor(private requestService:RequestService){}

    @Get()
    public async getRequestByUserId(@Req() req:Request){
        let result = await this.requestService.getRequestsByUserId(req.user['_id'])
        if(result.length>0){
            return result
        }else{
            throw new HttpException("No request owned by user",404)
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