import { Type } from "class-transformer"
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsObject, IsPhoneNumber, IsString, MinLength, ValidateNested } from "class-validator"
import { BLOODTYPES } from "../user.constants"
import { Address } from "./address"

export class CreateUserDTO{

    @IsString()
    @MinLength(5)
    userName:string
    @IsEmail()
    email:string
    @IsString()
    phoneNumber:string
    @IsNumber()
    age:number

    @ValidateNested()
    @Type(()=>Address)
    address:Address

    @MinLength(8)
    @IsString()
    password:string
    
    @IsEnum(BLOODTYPES)
    bloodType:string
}