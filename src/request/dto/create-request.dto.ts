import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { BLOODTYPES, CITYNAMES } from "../../common/constants";

export class CreateRequestDTO{
    @IsString()
    @IsNotEmpty()
    @IsEnum(BLOODTYPES)
    bloodType:string

    @IsNumber()
    @IsNotEmpty()
    requiredBloodUnit:number

    @IsString({each:true})
    @IsNotEmpty({each:true})
    @IsEnum(CITYNAMES,{each:true})
    address:string[]

    @IsOptional()
    @IsString()
    message:string


}