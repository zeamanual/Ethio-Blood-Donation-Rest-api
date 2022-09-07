import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { DonorModule } from './donor/donor.module';
import { RequestModule } from './request/request.module';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        // port:process.env.SMTP_PORT ,
        ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@eddp>',
      },
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    DonorModule,
    RequestModule,
    MongooseModule.forRoot(process.env.DATABASE_URL),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(){
  }
  
}
