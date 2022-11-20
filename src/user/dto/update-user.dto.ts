import { Type } from "class-transformer"
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from "class-validator"
import { CITYNAMES } from "../../common/constants"
import { BLOODTYPES, GENDER } from "../user.constants"
import { Address } from "./address"

export class UpdateUserDTO{

    @IsString()
    @MinLength(5)
    @IsOptional() 
    userName:string

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

    // @ValidateNested()
    // @Type(()=>Address)
    // @IsOptional() 
    // address:Address

    @IsString()
    @IsEnum(CITYNAMES)
    address:string

    @MinLength(8)
    @IsString()
    @IsOptional() 
    password:string
    
    @IsEnum(BLOODTYPES)
    @IsOptional() 
    bloodType:string
}