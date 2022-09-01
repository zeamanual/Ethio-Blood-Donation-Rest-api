import { Module } from "@nestjs/common";
import { DonorModule } from "../donor/donor.module";
import { UserModule } from "../user/user.module";
import { RequestController } from "./request.controller";
import { RequestService } from "./request.service";


@Module({
    imports:[
        UserModule,
        DonorModule
    ],
    providers:[RequestService],
    controllers:[RequestController],
    exports:[] 
})
export class RequestModule{

}