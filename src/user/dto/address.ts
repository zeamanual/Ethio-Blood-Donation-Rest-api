import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
 
export class Address {

    @IsString()
    @IsOptional()
    cityName?:string
    @IsNumber()
    latitude:number
    @IsNumber()
    longtitude:number
} 