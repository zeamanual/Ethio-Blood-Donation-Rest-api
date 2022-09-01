import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DonorModule } from "../donor/donor.module";
import { UserSchema } from "./schema/user.schma";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

 
@Module({
    imports:[        
        MongooseModule.forFeature([{name:'User',schema:UserSchema}]),
        forwardRef(()=> DonorModule)
    ],
    controllers:[UserController],
    providers:[UserService],
    exports:[UserService]
})
export class UserModule {

}