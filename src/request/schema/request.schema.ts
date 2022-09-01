import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from 'mongoose'
import { User } from "../../user/schema/user.schma";
import { BLOODTYPES, CITYNAMES } from "../../common/constants";
import { Donor } from "../../donor/schema/donor.schema";
import { REQUESTSTATUS } from "../request.constants";

export type RequestDoc = Request & Document

@Schema()
export class Request{

    @Prop({type:mongoose.Schema.Types.ObjectId,required:true, ref:'User'})
    userRef:User

    @Prop({type:String,required:true,enum:BLOODTYPES})
    bloodType:string

    @Prop({required:true})
    requiredBloodUnit:number

    @Prop({required:true})
    foundBloodUnit:number

    @Prop({required:true})
    remainingBloodUnit:number

    @Prop({required:true,type:[String],enum:CITYNAMES})
    address:string[]

    @Prop({required:true,type:mongoose.Schema.Types.ObjectId,ref:'Donor'})
    FoundDonors:Donor[]

    @Prop({required:true,type:String,enum:REQUESTSTATUS})
    status:string
}

export let RequestSchema = SchemaFactory.createForClass(Request)