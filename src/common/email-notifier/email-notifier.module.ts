import { Module } from "@nestjs/common";
import { EmailService } from "./email-notifier.service";

@Module({
    imports:[],
    providers:[EmailService],
    controllers:[],
    exports:[EmailService]
})
export class EmailNotifierModule {

}