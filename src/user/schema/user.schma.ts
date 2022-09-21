import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Address } from "../dto/address";
import { BLOODTYPES, GENDER, ROLES } from "../user.constants";


export type UserDoc = Document & User

@Schema()
export class User {
    
    @Prop({unique:true})
    userName:string

    @Prop()
    email:string

    @Prop()
    phoneNumber:string

    @Prop()
    age:number

    // @Prop(raw({cityName:String,longtitude:Number,latitude:Number}))
    // address:Address

    @Prop()
    address:string

    @Prop()
    password:string

    @Prop({enum:GENDER})
    gender:string

    @Prop({
        type:String,
        enum:BLOODTYPES
    })
    bloodType:string

    @Prop({
        type:[String],
        enum:ROLES
    })
    role:string[]

}

export const UserSchema = SchemaFactory.createForClass(User)