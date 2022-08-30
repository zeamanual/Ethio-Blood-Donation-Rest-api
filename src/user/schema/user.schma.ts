import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Address } from "../dto/address";
import { BLOODTYPES } from "../user.constants";


export type UserDoc = Document & User

@Schema()
export class User {
    
    @Prop({unique:true})
    userName:string

    @Prop()
    email:string

    @Prop({unique:true})
    phoneNumber:string

    @Prop()
    age:number

    @Prop(raw({cityName:String,longtitude:Number,latitude:Number}))
    address:Address

    @Prop()
    password:string

    @Prop({
        type:String,
        enum:BLOODTYPES
    })
    bloodType:string

    @Prop({
        type:[String],
        enum:['USER','DONOR','REQUESTER','ADMIN']
    })
    role:string[]

}

export const UserSchema = SchemaFactory.createForClass(User)