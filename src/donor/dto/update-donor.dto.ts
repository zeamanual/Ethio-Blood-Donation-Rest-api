import { IsString,IsNotEmpty,IsEnum, IsOptional, IsBoolean } from "class-validator";
import { CITYNAMES } from "../../common/constants";

export class UpdateDonorDTO{
    @IsString({each:true})
    @IsNotEmpty({each:true})
    @IsEnum(CITYNAMES,{each:true})
    address:string[]

    @IsBoolean()
    @IsNotEmpty()
    active:boolean
}
