import { Type } from "class-transformer"
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from "class-validator"
import { BLOODTYPES, GENDER } from "../user.constants"
import { Address } from "./address"

export class UpdateUserDTO{

    @IsOptional()    
    @IsEmail()
    email:string
    
    @IsString()
    @IsOptional() 
    phoneNumber:string

    @IsNumber()
    @IsOptional() 
    age:number

    @IsNotEmpty()
    @IsEnum(GENDER)
    @IsOptional() 
    gender:string

    @ValidateNested()
    @Type(()=>Address)
    @IsOptional() 
    address:Address

    @MinLength(8)
    @IsString()
    @IsOptional() 
    password:string
    
    @IsEnum(BLOODTYPES)
    @IsOptional() 
    bloodType:string
}