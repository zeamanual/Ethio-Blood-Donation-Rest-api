import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../user/user.module";
import { DonorController } from "./donor.controller";
import { DonorService } from "./donor.service";
import { DonorSchema } from "./schema/donor.schema";

@Module({
    imports:[
        MongooseModule.forFeature([{name:'Donor',schema:DonorSchema}]),
        forwardRef(()=>UserModule) 
    ],
    providers:[DonorService],
    controllers:[DonorController],
    exports:[DonorService]
})
export class DonorModule{

}