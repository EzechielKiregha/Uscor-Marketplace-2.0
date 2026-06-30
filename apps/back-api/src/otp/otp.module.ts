import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { OtpService } from "./otp.service";

@Module({
    imports: [PrismaModule, MailModule],
    providers: [OtpService, PrismaService],
    exports: [OtpService],
})
export class OtpModule {}
