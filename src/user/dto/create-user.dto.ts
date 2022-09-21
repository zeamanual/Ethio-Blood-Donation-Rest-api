import { Type } from "class-transformer"
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsObject, IsPhoneNumber, IsString, MinLength, ValidateNested } from "class-validator"
import { CITYNAMES } from "../../common/constants"
import { BLOODTYPES, GENDER } from "../user.constants"
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

    @IsNotEmpty()
    @IsEnum(GENDER)
    gender:string

    // @ValidateNested()
    // @Type(()=>Address)
    // address:Address
    @IsString()
    @IsEnum(CITYNAMES)
    address:string

    @MinLength(8)
    @IsString()
    password:string
    
    @IsEnum(BLOODTYPES)
    bloodType:string
}