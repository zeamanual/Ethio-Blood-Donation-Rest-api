import { HttpException, Injectable } from "@nestjs/common";
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
export class RequestService {

    constructor(@InjectModel('Request') private requestModel: Model<RequestDoc>, private donorService: DonorService, private emailService: EmailService) { }

    public async createRequest(userId: string, request: CreateRequestDTO) {
        let newRequest = new this.requestModel({
            ...request,
            userRef: userId,
            foundBloodUnit: 0,
            status: REQUESTSTATUS[0],
            date: new Date(),
            message: request?.message ? request.message : '',
            remainingBloodUnit: request.requiredBloodUnit,
            foundDonors: []
        })
        let result = await (await newRequest.save()).populate('userRef')
        let matchingDonors = await this.donorService.getDonorByQueryParametrs({ status: 'active', bloodType: request.bloodType, address: request.address, ignorepageNumber: true })
        if (matchingDonors.length > 0) {
            let recipientEmails = []
            for (let donor of matchingDonors) {
                if (donor.userRef.email) {
                    recipientEmails.push(donor.userRef.email)
                }
            }

            if (recipientEmails.length > 0) {
                this.emailService.sendEmail(`${result.userRef.userName} needs your help, check the donation portal at https://www.google.com to donate your blood and save life `, "Some one you can save is on the way",
                    // `<div style = 'font-family:sans-serif;padding:5em 1em;border-radius:1em;box-shadow: 2px 2px 10px black'> <h4 style='text-transform:capitalize;display:inline'>${result.userRef.userName}</h4> needs your help, check the donation portal <a href = 'https://www.google.com' style='text-decoration:none;background:blue;color:white;border-radius:1em;padding:0.2em 1em;margin:0.1em 0.2em' >here </a> to donate your blood and save life </div>`,
                    `<div style = ' display:flex;flex-direction:column;align-items:center; font-family:sans-serif;padding:5em 2em;border-radius:1em;box-shadow: 2px 2px 10px black'> <img style = 'width:50vw;object-fit:cover' src = 'https://www.bagmo.in/wp-content/uploads/2022/03/volunteers-woman-man-donating-blood-blood-donor-charity_262189-61.webp' />  <div style = 'margin:1em 0;line-height:2em'><h4 style='text-transform:capitalize;display:inline'> ${result.userRef.userName}</h4> needs your help, check the donation portal <a href = 'https://www.google.com' style='text-decoration:none;background:blue;color:white;border-radius:1em;padding:0.1em 1em;margin:0.1em 0.2em' >here </a> to donate your blood and save life</div> </div>`,
                    recipientEmails)
            }
        }

        return result
    }

    public async getRequestById(requestId: string) {
        let foundRequest = await (await this.requestModel.findOne({ _id: requestId }).populate("userRef")).populate('foundDonors')
        if (foundRequest) {
            return foundRequest
        } else {
            return null
        }
    }

    public async getRequestsByDonorId(donorId: string) {
        let foundRequests = await this.requestModel.find({ foundDonors: { $in: [donorId] } }).populate("userRef")
        return foundRequests
    }

    public async getRequestsByUserId(userId: string) {
        let results = await this.requestModel.find({ userRef: userId }).populate('userRef')
        return results
    }

    public async getRequestByAddressBloodTypeAndStatus(addresses: string[], bloodType: string, status: string[], pageNumber: number, ignorePageNumber: boolean = false) {
        if (ignorePageNumber) {
            return await this.requestModel.find({ address: { $in: [...addresses] }, bloodType: bloodType, status: { $in: [...status] } }).populate('userRef')
        }
        return await this.requestModel.find({ address: { $in: [...addresses] }, bloodType: bloodType, status: { $in: [...status] } }).skip((pageNumber * PAGESIZE) - PAGESIZE).limit(PAGESIZE).populate('userRef')
    }
    public async getRequestByBloodTypeAndStatus(bloodType: string, status: string[], pageNumber: number, ignorePageNumber: boolean = false) {
        if (ignorePageNumber) {
            return await this.requestModel.find({ bloodType: bloodType, status: { $in: [...status] } }).populate('userRef')
        }
        return await this.requestModel.find({ bloodType: bloodType, status: { $in: [...status] } }).skip((pageNumber * PAGESIZE) - PAGESIZE).limit(PAGESIZE).populate('userRef')
    }
    public async getRequestByAddressAndStatus(address: string[], status: string[], pageNumber: number, ignorePageNumber: boolean = false) {
        if (ignorePageNumber) {
            return await this.requestModel.find({ address: { $in: [...address] }, status: { $in: [...status] } }).populate('userRef')
        }
        return await this.requestModel.find({ address: { $in: [...address] }, status: { $in: [...status] } }).skip((pageNumber * PAGESIZE) - PAGESIZE).limit(PAGESIZE).populate('userRef')
    }
    public async getRequestByStatus(status: string[], pageNumber: number, ignorePageNumber: boolean = false) {
        if (ignorePageNumber) {
            return await this.requestModel.find({ status: { $in: status } }).populate('userRef')
        }
        return await this.requestModel.find({ status: { $in: status } }).skip((pageNumber * PAGESIZE) - PAGESIZE).limit(PAGESIZE).populate('userRef')
    }

    public async getDonorMatchingRequests(userId: string, pageNumber: number, ignorePage = false) {
        let donor = await this.donorService.getDonorByUserId(userId)
        let matchingRequests = []
        let ignorePageNumber = 'true'
        if (!ignorePage) {
            ignorePageNumber = 'false'
        }
        if (donor) {
            matchingRequests = await this.getRequestByQueryParametrs({ bloodType: donor.bloodType, address: donor.address, status: [REQUESTSTATUS[0], REQUESTSTATUS[1]], pageNumber, ignorePageNumber })
            return matchingRequests
        }
        throw new HttpException("Donor not found.", 404)
    }

    async getRequestByQueryParametrs(parameters: any) {
        let result = []
        let pageNumber = 1
        let status = [...REQUESTSTATUS]
        let ignorepageNumber = false

        if (parameters.status) {
            if (typeof parameters.status === 'string') {
                if (parameters.status !== 'all') {
                    status = [parameters.status]
                }
            } else if (typeof parameters.status === 'object') {
                status = [...parameters.status]
            }
        }

        // handling pagination 
        if (parameters.pageNumber) {
            let temp = parseInt(parameters.pageNumber)
            if (!isNaN(temp)) {
                pageNumber = temp
            }
        }

        // handing ignore page number
        if (parameters.ignorePageNumber) {
            if (parameters.ignorePageNumber === 'true') {
                ignorepageNumber = true
            }
        }

        // handling address and blood type of request
        if (parameters.bloodType && parameters.address) {
            if (typeof parameters.address == 'object') {
                result = await this.getRequestByAddressBloodTypeAndStatus(parameters.address, parameters.bloodType, status, pageNumber, ignorepageNumber)
            } else if (typeof parameters.address == 'string') {
                result = await this.getRequestByAddressBloodTypeAndStatus([parameters.address], parameters.bloodType, status, pageNumber, ignorepageNumber)
            } else {
                result = await this.getRequestByBloodTypeAndStatus(parameters.bloodType, status, pageNumber, ignorepageNumber)
            }
        } else if (parameters.bloodType) {
            result = await this.getRequestByBloodTypeAndStatus(parameters.bloodType, status, pageNumber, ignorepageNumber)
        } else if (parameters.address) {
            if (typeof parameters.address == 'object') {
                result = await this.getRequestByAddressAndStatus(parameters.address, status, pageNumber, ignorepageNumber)
            } else if (typeof parameters.address == 'string') {
                result = await this.getRequestByAddressAndStatus([parameters.address], status, pageNumber, ignorepageNumber)
            }
        } else {
            result = await this.getRequestByStatus(status, pageNumber, ignorepageNumber)
        }

        return result
    }

    public async addDonorForRequest(requestId: string, donorId: string) {
        let existingRequest = await this.requestModel.findOne({ _id: requestId })
        let updated = null
        if (existingRequest) {
            if (existingRequest.remainingBloodUnit === 0) {
                return null
            } else {
                if (existingRequest.remainingBloodUnit === 1) {
                    updated = await this.requestModel.findOneAndUpdate({ _id: requestId }, { remainingBloodUnit: existingRequest.remainingBloodUnit - MAXDONATIONUNIT, foundBloodUnit: existingRequest.foundBloodUnit + MAXDONATIONUNIT, status: REQUESTSTATUS[2], foundDonors: [...existingRequest.foundDonors, donorId] }, { runValidators: true, new: true }).populate('userRef')
                }
                else {
                    updated = await this.requestModel.findOneAndUpdate({ _id: requestId }, { remainingBloodUnit: existingRequest.remainingBloodUnit - MAXDONATIONUNIT, foundBloodUnit: existingRequest.foundBloodUnit + MAXDONATIONUNIT, status: REQUESTSTATUS[1], foundDonors: [...existingRequest.foundDonors, donorId] }, { runValidators: true, new: true }).populate('userRef')
                }
                let notificationRecipientEmail = [updated.userRef.email]
                await this.donorService.addRequestRef(donorId, requestId)

                if (notificationRecipientEmail.length > 0) {
                    this.emailService.sendEmail(`Hellow dear ${updated.userRef.userName}, we hope you are doing well. A new donor has been found for your request. Check the details on the portal `
                        , 'Donor Found',
                        `<div style = ' display:flex;flex-direction:column;align-items:center; font-family:sans-serif;padding:5em 2em;border-radius:1em;box-shadow: 2px 2px 10px black'> <img style = 'width:50vw;object-fit:cover' src = 'https://www.bagmo.in/wp-content/uploads/2022/03/volunteers-woman-man-donating-blood-blood-donor-charity_262189-61.webp' /> <p style = 'text-align:justify'> Hellow dear ${updated.userRef.userName}, we hope you are doing well. A new donor has been found for your request. Check the details on the <a href = 'https://www.google.com' style='text-decoration:none;background:blue;color:white;border-radius:1em;padding:0.1em 1em;margin:0.1em 0.2em' >Portal </a></p> </div>`,
                        notificationRecipientEmail)
                }
                return updated

            }
        } else {
            return null
        }
    }

    public async updateRequest(requestId: string, request: UpdateRequestDTO) {


        let existingRequest = await this.requestModel.findOne({ _id: requestId })
        let remainingBloodUnit = request.requiredBloodUnit - existingRequest.foundBloodUnit
        let status = remainingBloodUnit===request.requiredBloodUnit?'pending'
        :remainingBloodUnit==0?'fulfilled':'progress'
        let updatedRequest = await this.requestModel.findOneAndUpdate(
            { _id: requestId },
            {
                ...request,
                remainingBloodUnit,
                status
            },
            { runValidators: true, new: true })
        return updatedRequest
    }
    public async deleteRequest(requestId: string) {
        return await this.requestModel.findOneAndDelete({ _id: requestId })
    }
}