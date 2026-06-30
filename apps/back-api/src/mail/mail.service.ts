import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import {
    otpEmailTemplate,
    passwordChangedEmailTemplate,
    welcomeEmailTemplate,
} from "./mail.templates";

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);
    private readonly fromAddress: string;

    constructor(private configService: ConfigService) {
        this.fromAddress =
            this.configService.get<string>("SMTP_FROM") ||
            "USCOR Marketplace <noreply@uscor.com>";

        this.transporter = nodemailer.createTransport({
            service: "Gmail",
            // host:
            //     this.configService.get<string>("SMTP_HOST") || "smtp.gmail.com",
            // port: Number(this.configService.get<string>("SMTP_PORT")) || 587,
            // secure: false,
            auth: {
                type: "OAuth2",
                user: this.configService.get<string>("SMTP_USER"),
                clientId: this.configService.get<string>("SMTP_CLIENT_ID"),
                clientSecret:
                    this.configService.get<string>("SMTP_CLIENT_SECRET"),
                refreshToken:
                    this.configService.get<string>("SMTP_REFRESH_TOKEN"),
            },
        } as any);
    }

    private async send(
        to: string,
        subject: string,
        html: string,
    ): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${subject}`);
            return true;
        } catch (error: any) {
            this.logger.error(
                `Failed to send email to ${to}: ${error.message}`,
            );
            return false;
        }
    }

    async sendOtpEmail(
        to: string,
        otp: string,
        purpose: string,
    ): Promise<boolean> {
        const { subject, html } = otpEmailTemplate(otp, purpose);
        return this.send(to, subject, html);
    }

    async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
        const { subject, html } = welcomeEmailTemplate(name);
        return this.send(to, subject, html);
    }

    async sendPasswordChangedEmail(to: string, name: string): Promise<boolean> {
        const { subject, html } = passwordChangedEmailTemplate(name);
        return this.send(to, subject, html);
    }
}
