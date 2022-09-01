import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { BLOODTYPES, CITYNAMES } from "../../common/constants"

export class UpdateRequestDTO{
    @IsString({each:true})
    @IsOptional()
    @IsEnum(BLOODTYPES,{each:true})
    bloodType:string[]

    @IsNumber()
    @IsOptional()
    requiredBloodUnit:number

    @IsString({each:true})
    @IsOptional()
    @IsEnum(CITYNAMES,{each:true})
    address:string[]
}