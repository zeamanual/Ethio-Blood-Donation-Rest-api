import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose'
import { CITYNAMES } from "../../common/constants";
import { User } from "../../user/schema/user.schma";

export type DonorDoc = Donor & mongoose.Document

@Schema()
export class Donor{
    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'User'})
    userRef:User

    @Prop({type:[String],enum:CITYNAMES})
    address:string[]

    @Prop()
    bloodType:string

    @Prop()
    isElligibleToDonate:boolean

    @Prop({type:Date})
    lastDonationDate:Date

    @Prop()
    isActive:boolean

    @Prop({type:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}]})
    donatedFor:User
}

export const DonorSchema = SchemaFactory.createForClass(Donor)