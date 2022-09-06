import { Body, Controller, Get, HttpCode, HttpException, Param, Post, Put, Query, Req, Res, SetMetadata, UseGuards } from "@nestjs/common";
import { query, Request } from "express";
import { RolesGuard } from "../auth/roles.authguard";
import { JwtAuthGuard } from "../auth/jwt.authguard";
import { DonorService } from "./donor.service";
import { CreateDonorDTO } from "./dto/create-donor.dto";
import { UpdateDonorDTO } from "./dto/update-donor.dto";

@UseGuards(JwtAuthGuard,RolesGuard)
@Controller("donor")
export class DonorController{
 
    constructor(private donorService:DonorService){}
   
    @Get()
    public async getDonorByUserId(@Req() req:Request){
        let donorFound = await this.donorService.getDonorByUserId(req.user['_id'])
        if(donorFound){
            return donorFound
        }else{
            throw new HttpException('User is not a donor',404)
        }
    }

    @Get('filter')
    public async getDonorsByFilter(@Query() queryParams){
        let foundMatches = await this.donorService.getDonorByQueryParametrs(queryParams)
        if(foundMatches.length>0){
            if( Object.keys(queryParams).includes('sizeOnly')){
                return foundMatches.length
            }else{
                return foundMatches
            }
        }else{
            throw new HttpException("No donor with specified filter found",404)
        }
    }

    @Get('/:donorId')
    public async getDonorById(@Param('donorId') donorId:string){
        let donorFound = await this.donorService.getDonorById(donorId)
        if(donorFound){
            return donorFound
        }else{
            throw new HttpException('Donor not found',404)
        }
    }
   
    @Post()
    @HttpCode(201)
    public async createDonor(@Req() req:Request,@Body() donorDetail:CreateDonorDTO){
        let created = await this.donorService.createDonor(req.user['_id'],donorDetail)
        if(created) return {msg:'Sucessful'} 
        if(!created) throw new HttpException("Try again",400)
     }

    @SetMetadata('role','DONOR')
    @Put()
    public async updateDonor(@Req() req:Request,@Body() donor:UpdateDonorDTO){
        let updated = await this.donorService.updateDonor(req.user['_id'],donor)
        if(updated){
            return updated
        }else{
            throw new HttpException("User is not a donor",404)
        }
    }
}