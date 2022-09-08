import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
    constructor(private mailerService:MailerService){}

    public async sendEmail(message:string,subject:string,html:string='',recipients:string[]){
        let receivers = ''
        for(let address of recipients){
            receivers+=`${address},`
        }

        try {
            let response = await this.mailerService.sendMail({
                to:receivers,
                from:'"Ethio Digital Blood Donation" <Ethio-Digital-Blood-Donation@zeamanual>',
                text:message,
                subject,
                html
    
            })
            console.log("E-mail sent successfully, Response: ",response)
            return response            
        } catch (error) {
            console.log("Error occured while sending E-mail. Error: ",error)
            return error
        }

    }
}