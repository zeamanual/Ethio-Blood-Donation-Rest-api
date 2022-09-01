import { Controller, HttpCode, HttpException, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt.authguard";
import { DonorService } from "./donor.service";

@UseGuards(JwtAuthGuard)
@Controller("donor")
export class DonorController{
 
    constructor(private donorService:DonorService){}
   
    @Post()
    @HttpCode(201)
    public async createDonor(@Req() req:Request){
        let created = await this.donorService.createDonor(req.user['_id'])
        if(created) return {msg:'Sucessful'} 
        if(!created) throw new HttpException("Try again",400)
     }
    @Put('disable')
    @HttpCode(200)
    public async disableDonor(@Req() req:Request){
        return await this.donorService.disableDonor(req.user['_id'])
    }

    @Put("enable")
    @HttpCode(202)
    public async enableDonor(@Req() req:Request){
        return await this.donorService.enableDonor(req.user['_id'])
    }
}