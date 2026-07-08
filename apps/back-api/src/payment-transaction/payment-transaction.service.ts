import { Injectable, Logger } from "@nestjs/common";
import { AccountRechargeService } from "../account-recharge/account-recharge.service";
import {
    Country,
    RechargeMethod,
} from "../account-recharge/dto/create-account-recharge.input";
import { BusinessService } from "../business/business.service";
import { ClientService } from "../client/client.service";
import { divPrecise } from "../common/token-math";
import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from "../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentTransactionInput } from "./dto/create-payment-transaction.input";
import { UpdatePaymentTransactionInput } from "./dto/update-payment-transaction.input";
import { PaymentTransactionEntity } from "./entities/payment-transaction.entity";

// Service
@Injectable()
export class PaymentTransactionService {
    private readonly logger = new Logger(PaymentTransactionService.name);

    constructor(
        private prisma: PrismaService,
        private accountRechargeService: AccountRechargeService,
        private readonly businessService: BusinessService,
        private readonly clientService: ClientService,
    ) {}

    async processPayment(input: any) {
        const result = {
          status: 'PENDING_SYNC',
        }

        return result
    }

    async generateUssdCode(provider: string, amount: number, phone: string, country: string){

    }

    async validateBalance(
        clientId: string,
        amount: number,
        method: RechargeMethod,
    ): Promise<boolean> {
        let mtd;

        switch (method) {
            case RechargeMethod.MTN_MONEY:
                mtd = RechargeMethod.MTN_MONEY;
                break;
            case RechargeMethod.AIRTEL_MONEY:
                mtd = RechargeMethod.AIRTEL_MONEY;
                break;
            case RechargeMethod.MPESA:
                mtd = RechargeMethod.MPESA;
                break;
            case RechargeMethod.ORANGE_MONEY:
                mtd = RechargeMethod.ORANGE_MONEY;
                break;
            case RechargeMethod.TOKEN:
                mtd = RechargeMethod.TOKEN;
                break;
            default:
                throw new Error("Invalid recharge method");
        }

        const balance = await this.accountRechargeService.getBalance(
            clientId,
            "client",
            mtd,
        );
        return divPrecise(balance.totalAmount, 10) >= amount;
    }

    async create(
        createPaymentTransactionInput: CreatePaymentTransactionInput,
        clientId: string,
    ) {
        const { orderId, method, amount, ...data } =
            createPaymentTransactionInput;

        // Check if PaymentTransaction already exists for the order
        const existingTransaction =
            await this.prisma.paymentTransaction.findUnique({
                where: { orderId },
            });
        if (existingTransaction) {
            throw new Error(
                "Payment transaction already initialized for this order. Use update instead.",
            );
        }

        // Ensure order belongs to client
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { clientId: true },
        });

        if (!order || order.clientId !== clientId) {
            throw new Error(
                "Clients can only create payments for their own orders",
            );
        }

        // Validate token balance for TOKEN method
        if (method === PaymentMethod.TOKEN) {
            const hasEnoughTokens = await this.validateBalance(
                clientId,
                amount || 0,
                RechargeMethod.TOKEN,
            );
            if (!hasEnoughTokens) {
                throw new Error("Insufficient token balance");
            }
        }

        return this.prisma.paymentTransaction.create({
            data: {
                ...data,
                amount: amount || 0,
                method,
                order: { connect: { id: orderId } },
            },
            select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                transactionDate: true,
                qrCode: true,
                createdAt: true,
                order: {
                    select: {
                        id: true,
                        deliveryFee: true,
                        deliveryAddress: true,
                        createdAt: true,
                    },
                },
                postTransactions: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    async update(
        updatePaymentTransactionInput: UpdatePaymentTransactionInput,
        transId?: string,
        phone?: string,
    ) {
        let userId;
        const id = transId;
        let client;
        let business;
        if (phone) {
            client = await this.clientService.findByPhone(phone);

            if (client) {
                userId = client.id;
            }

            if (!client) {
                business = await this.businessService.findOneByPhone(phone);
                if (business) {
                    userId = business.id;
                }
            }

            // const latestTransaction = await this.findLatest(phone);
            // if (latestTransaction) {
            //     id = latestTransaction.id;
            // }
        }

        const { status, qrCode } = updatePaymentTransactionInput;
        const transaction = await this.findOne(id!);
        if (!transaction) {
            throw new Error("Payment transaction not found");
        }

        // Check ownership/authorization
        const order = await this.prisma.order.findUnique({
            where: { id: transaction?.orderId! },
            select: {
                id: true,
                clientId: true,
                payment: true,
                products: {
                    select: {
                        product: {
                            select: { businessId: true },
                        },
                    },
                },
            },
        });

        if (!order) throw new Error("Order not found");

        const isBusinessOwner = order.products.some(
            (item) => item.product.businessId === userId,
        );


        if (!isBusinessOwner && order.clientId !== userId) {
            throw new Error(
                "You are not authorized to update this payment transaction",
            );
        }

        if (!order.payment)
            throw new Error("This order's payment was not initialized");

        // If status is changing to COMPLETED, validate and deduct balance atomically
        if (
            status === "COMPLETED" &&
            transaction.status !== PaymentStatus.COMPLETED
        ) {
            // Collect business IDs for settlement (credit to seller)
            const businessIds = [
                ...new Set(order.products.map((p) => p.product.businessId)),
            ];

            if (!phone) {
                if (transaction.method === PaymentMethod.TOKEN) {
                    const hasEnoughTokens = await this.validateBalance(
                        order.clientId,
                        transaction.amount,
                        RechargeMethod.TOKEN,
                    );
                    if (!hasEnoughTokens) {
                        throw new Error("Insufficient token balance");
                    }
                    // Deduct balance from client
                    await this.accountRechargeService.create(
                        {
                            amount: -transaction.amount,
                            method: RechargeMethod.TOKEN,
                            origin: Country.RWANDA,
                            clientId: order.clientId,
                            businessId: undefined,
                        },
                        order.clientId,
                        "client",
                    );
                    // Settle to each business
                    for (const bizId of businessIds) {
                        await this.accountRechargeService.create(
                            {
                                amount: transaction.amount / businessIds.length,
                                method: RechargeMethod.TOKEN,
                                origin: Country.RWANDA,
                                clientId: undefined,
                                businessId: bizId,
                            },
                            bizId,
                            "business",
                        );
                    }
                } else if (transaction.method === PaymentMethod.MOBILE_MONEY) {
                    let mtd = RechargeMethod.AIRTEL_MONEY;
                    let hasEnoughBalance = await this.validateBalance(
                        order.clientId,
                        transaction.amount,
                        mtd,
                    );

                    if (!hasEnoughBalance) {
                        mtd = RechargeMethod.MTN_MONEY;
                        hasEnoughBalance = await this.validateBalance(
                            order.clientId,
                            transaction.amount,
                            mtd,
                        );
                        if (!hasEnoughBalance) {
                            mtd = RechargeMethod.ORANGE_MONEY;
                            hasEnoughBalance = await this.validateBalance(
                                order.clientId,
                                transaction.amount,
                                mtd,
                            );
                            if (!hasEnoughBalance) {
                                mtd = RechargeMethod.MPESA;
                                hasEnoughBalance = await this.validateBalance(
                                    order.clientId,
                                    transaction.amount,
                                    mtd,
                                );
                            }
                        }
                    }
                    if (!hasEnoughBalance) {
                        throw new Error("Insufficient mobile money balance");
                    }
                    // Deduct balance from client
                    await this.accountRechargeService.create(
                        {
                            amount: -transaction.amount,
                            method: mtd,
                            origin: Country.RWANDA,
                            clientId: order.clientId,
                            businessId: undefined,
                        },
                        order.clientId,
                        "client",
                    );
                    // Settle to each business
                    for (const bizId of businessIds) {
                        await this.accountRechargeService.create(
                            {
                                amount: transaction.amount / businessIds.length,
                                method: mtd,
                                origin: Country.RWANDA,
                                clientId: undefined,
                                businessId: bizId,
                            },
                            bizId,
                            "business",
                        );
                    }
                }
            }

            this.logger.log(
                `Payment ${id} completed: ${transaction.method} $${transaction.amount} for order ${order.id}`,
            );
        }

        await this.prisma.order.updateMany({
            where: {
                clientOrderId: order.id
            },
            data: {
                status: OrderStatus.PROCESSING,
                ...(qrCode && { qrCode }),
            },
        })

        return this.prisma.paymentTransaction.update(
          {
            where: { orderId: order.id },
            data: {
              ...(status && {
                status: status as any,
              }),
              ...(qrCode && { qrCode }),
              order: {
                update: {
                  status: OrderStatus.PROCESSING,
                },
              },
            },
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              transactionDate: true,
              qrCode: true,
              createdAt: true,
              order: {
                select: {
                  id: true,
                  deliveryFee: true,
                },
              },
            },
          },
        )
    }

    async createRechargePayment(
        input: CreatePaymentTransactionInput,
        user: any
    ) {
        const { method, amount, ...data } = input;

        return this.prisma.paymentTransaction.create({
            data: {
                ...data,
                amount: amount || 0,
                method,
                order: undefined,
                clientId: user ? user?.id : undefined
            },
            select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                transactionDate: true,
                qrCode: true,
                createdAt: true,
            },
        });
    }
    async cancelPaymentTransaction(id: string) {
        return this.prisma.paymentTransaction.update({
            where: { id },
            data: {
                status: PaymentStatus.FAILED,
            },
            select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                transactionDate: true,
                qrCode: true,
                createdAt: true,
            },
        });
    }
    async checkPaymentTransactionStatus(id: string) {
        return this.prisma.paymentTransaction.findUnique({
            where: { id },
            select: {
                id: true,
                amount: true,
                method: true,
                status: true,
            },
        });
    }

    async updateRechargePayment(
        updatePaymentTransactionInput: UpdatePaymentTransactionInput,
        transId?: string,
        phone?: string,
    ) {
        let userId;
        let id = transId;
        let client;
        let business;
        let latestTransaction
        let role
        if (phone) {
            client = await this.clientService.findByPhone(phone);

            if (client) {
                userId = client.id;
                role = "client"
            }

            if (!client) {
                business = await this.businessService.findOneByPhone(phone);
                if (business) {
                    userId = business.id;
                    role = "business"
                }
            }

            if (!userId) throw new Error("Unauthorized role");

            latestTransaction = await this.findLatest(phone);
            if (latestTransaction && !id) {
                id = latestTransaction.id;
            }
        }

        const { status, qrCode } = updatePaymentTransactionInput;

        const effectiveId = id ?? latestTransaction?.id;
        if (!effectiveId) {
            throw new Error("Payment transaction not found");
        }

        const transaction = await this.prisma.paymentTransaction.update({
            where: { id: effectiveId },
            data: {
                ...(status && { status: status as any }),
                ...(qrCode && { qrCode }),
            },
            select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                transactionDate: true,
                qrCode: true,
                createdAt: true,
            },
        });

        return transaction
    }

    async findOne(id: string) {
        return this.prisma.paymentTransaction.findUnique({
            where: { id },
            include: {
                order: {
                    select: {
                        id: true,
                        deliveryFee: true,
                        deliveryAddress: true,
                        createdAt: true,
                    },
                },
                postTransactions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    async findAllByUser(userId: string, role: string) {
        const where: any = {};
        if (role === "client") {
            where.order = { clientId: userId };
        } else if (role === "business") {
            where.order = {
                products: {
                    some: {
                        product: { businessId: userId },
                    },
                },
            };
        } else {
            throw new Error("Unauthorized role");
        }

        const items = await this.prisma.paymentTransaction.findMany({
            where,
            include: {
                order: {
                    select: {
                        id: true,
                        deliveryFee: true,
                        deliveryAddress: true,
                        createdAt: true,
                    },
                },
                postTransactions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });

        return items.map((t: any) => ({
            ...t,
            postTransaction: t.postTransactions?.[0] ?? null,
        }));
    }

    async findLatest(phone: string, status?: string): Promise<PaymentTransactionEntity | null> {
        // Resolve phone → userId (client or business)
        const client = await this.prisma.client.findUnique({
            where: { phone },
            select: { id: true },
        });

        const businessId = !client
            ? (await this.prisma.business.findUnique({
                where: { phone },
                select: { id: true },
            }))?.id
            : null;

        const clientId = client?.id;

        if (!clientId && !businessId) return null;

        // 1. Calculate the 15-minute cutoff window
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        // 2. Setup base where filters
        const where: any = { 
            status: {
                in: [PaymentStatus.PENDING, PaymentStatus.COMPLETED]
            },
            // createdAt: {
            //     gte: fifteenMinutesAgo 
            // },
            // Enforces that a linked Order MUST exist AND its clientOrderId MUST be null
            order: {
                clientOrderId: null
            }
        };

        // 3. Keep conditional OR logic for client / business filters
        const or: any[] = [];
        if (clientId) or.push({ clientId });
        if (businessId) {
            or.push({ order: { products: { some: { product: { businessId } } } } });
        }
        if (or.length) where.OR = or;

        // 4. Query the single latest transaction matching all parameters
        const t = await this.prisma.paymentTransaction.findFirst({
            where: { ...where },
            orderBy: { createdAt: "desc" }, // Ensures you get the latest record
            include: {
                order: {
                    select: {
                        id: true,
                        deliveryFee: true,
                        deliveryAddress: true,
                        clientOrderId: true,
                        createdAt: true,
                        updatedAt: true,
                        client: true,
                    },
                },
                postTransactions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });



        console.log({t})

        if (!t) return null;

        let address: any = null;
        if (t?.order?.deliveryAddress) {
            address = await this.prisma.address.findUnique({
                where: { id: t.order.deliveryAddress },
            });
        }

        return ({
            ...(t as any),
            order: {
                ...(t.order as any),
                deliveryAddress: address
                    ? {
                          ...address,
                          country: address.country ?? undefined,
                          postalCode: address.postalCode ?? undefined,
                      }
                    : null,
            },
        } as PaymentTransactionEntity);
    }

    async findOneByUser(id: string, userId: string, role: string) {
        const transaction = await this.prisma.paymentTransaction.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        products: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
                postTransactions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!transaction) {
            throw new Error("Payment transaction not found");
        }

        if (role === "client") {
            if (transaction.order?.clientId !== userId) {
                throw new Error(
                    "Clients can only access their own payment transactions",
                );
            }
        } else if (role === "business") {
            const isAuthorized = transaction.order?.products.some(
                (item) => item.product.businessId === userId,
            );
            if (!isAuthorized) {
                throw new Error(
                    "Businesses can only access transactions for their products",
                );
            }
        }

        return {
            ...transaction,
            postTransaction: transaction.postTransactions?.[0] ?? null,
        };
    }

    async removeByUser(id: string, userId: string) {
        const transaction = await this.findOne(id);
        if (!transaction) {
            throw new Error("Payment transaction not found");
        }

        const order = await this.prisma.order.findUnique({
            where: { id: transaction?.orderId! },
            select: { clientId: true },
        });

        if (!order || order.clientId !== userId) {
            throw new Error(
                "Clients can only delete their own payment transactions",
            );
        }

        return this.prisma.paymentTransaction.delete({
            where: { id },
            select: { id: true, amount: true },
        });
    }
}
