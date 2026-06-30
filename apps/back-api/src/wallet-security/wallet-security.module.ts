import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { WalletSecurityResolver } from "./wallet-security.resolver";
import { WalletSecurityService } from "./wallet-security.service";

@Module({
    imports: [PrismaModule],
    providers: [WalletSecurityResolver, WalletSecurityService, PrismaService],
    exports: [WalletSecurityService],
})
export class WalletSecurityModule {}
