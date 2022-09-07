import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EmailNotifierModule } from "../common/email-notifier/email-notifier.module";
import { DonorModule } from "../donor/donor.module";
import { UserModule } from "../user/user.module";
import { RequestController } from "./request.controller";
import { RequestService } from "./request.service";
import { RequestSchema } from "./schema/request.schema";


@Module({
    imports:[
        UserModule,
        DonorModule,
        EmailNotifierModule,
        MongooseModule.forFeature([{name:'Request',schema:RequestSchema}])
    ],
    providers:[RequestService],
    controllers:[RequestController],
    exports:[] 
})
export class RequestModule{

}