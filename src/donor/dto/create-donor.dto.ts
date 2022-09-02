import { IsString,IsNotEmpty,IsEnum } from "class-validator";
import { CITYNAMES } from "../../common/constants";

export class CreateDonorDTO{
    @IsString({each:true})
    @IsNotEmpty({each:true})
    @IsEnum(CITYNAMES,{each:true})
    address:string[]
}
