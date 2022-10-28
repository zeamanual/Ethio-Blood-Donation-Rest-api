import { Body, Controller, Delete, Get, HttpCode, HttpException, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { DonorService } from "../donor/donor.service";
import { JwtAuthGuard } from "../auth/jwt.authguard";
import { CreateRequestDTO } from "./dto/create-request.dto";
import { UpdateRequestDTO } from "./dto/update-request.dto";
import { RequestService } from "./request.service";
import { Address } from "src/user/dto/address";
// import { UserService } from "src/user/user.service";
import { UserService } from "../user/user.service";

@UseGuards(JwtAuthGuard)
@Controller('request')
export class RequestController {
    constructor(private requestService: RequestService, private donorService: DonorService, private userService: UserService) { }

    @Get()
    public async getRequestByUserId(@Req() req: Request) {
        let result = await this.requestService.getRequestsByUserId(req.user['_id'])
        if (result.length > 0) {
            return result
        } else {
            throw new HttpException("No request owned by user", 404)
        }
    }
    @Get('filter')
    public async getRequestByAddressBloodTypeAndStatus(@Query() queryParams) {
        let foundMatches = await this.requestService.getRequestByQueryParametrs(queryParams)
        if (foundMatches.length > 0) {
            if (Object.keys(queryParams).includes('sizeOnly')) {
                return foundMatches.length
            } else {
                return foundMatches
            }

        } else {
            throw new HttpException("No request with specified filter found", 404)
        }
    }

    @Get('byDonorId/')
    public async getRequestByDonorId(@Req() req: Request) {
        let donor = await this.donorService.getDonorByUserId(req.user['_id'])
        if (donor) {
            let requests = await this.requestService.getRequestsByDonorId(donor['_id'])
            if (requests.length < 1) {
                throw new HttpException("You Havn't Donated Before", 404)
            }
            return requests
        } else {
            throw new HttpException('User Not A Donor', 400)
        }
    }

    @Get('match/:pageNumber')
    public async getDonorMatchingRequests(@Param('pageNumber', ParseIntPipe) pageNumber: number, @Req() request: Request, @Query() queryParams) {
        let ignorePageNumber = false
        if (queryParams.ignorePageNumber == 'true') {
            ignorePageNumber = true
        }
        let matchingRequests = await this.requestService.getDonorMatchingRequests(request.user['_id'], pageNumber, ignorePageNumber)
        if (matchingRequests.length > 0) {
            if (ignorePageNumber) {
                return matchingRequests.length
            }
            return matchingRequests
        }
        throw new HttpException("No matching requests found", 404)
    }
    @Get('/:requestId')
    public async getRequestById(@Req() req: Request, @Param("requestId") requestId: string) {
        let result = await this.requestService.getRequestById(requestId)
        if (result) {
            if (result.userRef['_id'] == req.user['_id']) {
                let donorsList = result.foundDonors
                let donorsDetail:any = await Promise.all(donorsList.map(async (donor) => {
                    let userDetail = await this.userService.getById(donor.userRef['_id'])
                    return { userName:userDetail.userName,email:userDetail.email,phoneNumber:userDetail.phoneNumber }
                }))
                return {...result['_doc'],donorsDetail}
            }
            return result
        } else {
            throw new HttpException("Request can not be found", 404)
        }
    }

    @Post()
    public async createRequest(@Req() req: Request, @Body() request: CreateRequestDTO) {
        let result = await this.requestService.createRequest(req.user['_id'], request)
        return result
    }

    @Put('/:requestId/donate')
    public async addDonorForRequest(@Req() req: Request, @Param("requestId") requestId: string) {
        let donor = await this.donorService.getDonorByUserId(req.user['_id'])
        let request = await this.requestService.getRequestById(requestId)

        if (donor && donor.isElligibleToDonate) {
            if (donor.bloodType === request.bloodType) {
                let updated = await this.requestService.addDonorForRequest(requestId, donor['_id'])
                if (!updated) {
                    throw new HttpException("Request already fulfilled", 404)
                }
            } else {
                throw new HttpException("Blood group doesn't match", 400)
            }
        } else {
            throw new HttpException("User not a donor or User not elligible to donate", 403)
        }
    }

    @Put("/:requestId")
    @HttpCode(200)
    public async updateRequest(@Param('requestId') requestId: string, @Body() request: UpdateRequestDTO, @Req() req: Request) {
        let existingRequest = await this.requestService.getRequestById(requestId)
        if (existingRequest) {
            if (existingRequest.userRef == req.user['_id']) {
                return await this.requestService.updateRequest(requestId, request)
            } else {
                throw new HttpException("It is not a request you have created", 403)
            }
        } else {
            throw new HttpException("Request not found", 404)
        }
    }

    @Delete('/:requestId')
    @HttpCode(200)
    public async deleteRequest(@Req() req: Request, @Param("requestId") requestId: string) {
        let existingRequest = await this.requestService.getRequestById(requestId)
        if (existingRequest) {
            if (existingRequest.userRef == req.user['_id']) {
                await this.requestService.deleteRequest(requestId)
            } else {
                throw new HttpException("It is not a request you have created", 403)
            }
        } else {
            throw new HttpException("Request not found", 404)
        }
    }
}