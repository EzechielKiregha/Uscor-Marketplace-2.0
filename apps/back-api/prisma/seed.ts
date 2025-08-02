// import { faker } from '@faker-js/faker';
// import { Country, FreelanceStatus, KycStatus, MediaType, PaymentMethod, PaymentStatus, PrismaClient, RechargeMethod } from '../src/generated/prisma/client';

// const prisma = new PrismaClient();

// async function main(): Promise<void> {
//   // 1. Create Tokens
//   await prisma.token.createMany({
//     data: Array.from({ length: 10 }).map(() => ({
//       value: faker.number.int({ min: 1, max: 100 }),
//     })),
//   });

//   // 2. Create Businesses
//   const businesses = await prisma.business.createMany({
//     data: Array.from({ length: 10 }).map(() => ({
//       name: faker.company.name(),
//       email: faker.internet.email(),
//       description: faker.company.catchPhrase(),
//       address: faker.location.streetAddress(),
//       phone: faker.phone.number(),
//       password: faker.internet.password(),
//       isVerified: faker.datatype.boolean(),
//       avatar: faker.image.avatar(), // Add avatar URL
//       coverImage: faker.image.url(), // Add cover image URL
//     })),
//   });
//   const businessRecords = await prisma.business.findMany();

//   // 3. Create Clients
//   const clients = await prisma.client.createMany({
//     data: Array.from({ length: 50 }).map(() => ({
//       username: faker.internet.username(),
//       email: faker.internet.email(),
//       fullName: faker.person.fullName(),
//       address: faker.location.streetAddress(),
//       phone: faker.phone.number(),
//       password: faker.internet.password(),
//       isVerified: faker.datatype.boolean(),
//       avatar: faker.image.avatar(), // Add avatar URL
//     })),
//   });
//   const clientRecords = await prisma.client.findMany();

//   // 4. Create Workers
//   await prisma.worker.createMany({
//     data: Array.from({ length: 20 }).map(() => ({
//       email: faker.internet.email(),
//       fullName: faker.person.fullName(),
//       role: faker.helpers.arrayElement(['Manager', 'Sales', 'Support']),
//       phone: faker.phone.number(),
//       password: faker.internet.password(),
//       businessId: faker.helpers.arrayElement(businessRecords).id,
//     })),
//   });

//   // 5. Create Products
//   const products = await prisma.product.createMany({
//     data: Array.from({ length: 100 }).map(() => ({
//       title: faker.commerce.productName(),
//       description: faker.commerce.productDescription(),
//       price: parseFloat(faker.commerce.price()),
//       stock: faker.number.int({ min: 0, max: 100 }),
//       category: faker.commerce.department(),
//       businessId: faker.helpers.arrayElement(businessRecords).id,
//     })),
//   });
//   const productRecords = await prisma.product.findMany();

//   // 6. Create Media
//   await prisma.media.createMany({
//     data: Array.from({ length: 300 }).map(() => ({
//       url: faker.image.urlLoremFlickr(),
//       type: faker.helpers.arrayElement([MediaType.IMAGE, MediaType.VIDEO]),
//       productId: faker.helpers.arrayElement(productRecords).id,
//     })),
//   });

//   // 7. Create Orders
//   const orders = await prisma.order.createMany({
//     data: Array.from({ length: 200 }).map(() => ({
//       clientId: faker.helpers.arrayElement(clientRecords).id,
//       deliveryFee: faker.number.float({ min: 0, max: 50 }),
//       deliveryAddress: faker.location.streetAddress(),
//     })),
//   });
//   const orderRecords = await prisma.order.findMany();

//   // 8. Create OrderProduct relations
//   await prisma.orderProduct.createMany({
//     data: Array.from({ length: 500 }).map(() => ({
//       orderId: faker.helpers.arrayElement(orderRecords).id,
//       productId: faker.helpers.arrayElement(productRecords).id,
//       quantity: faker.number.int({ min: 1, max: 5 }),
//     })),
//   });

//   // 9. Create Reviews
//   await prisma.review.createMany({
//     data: Array.from({ length: 150 }).map(() => ({
//       clientId: faker.helpers.arrayElement(clientRecords).id,
//       productId: faker.helpers.arrayElement(productRecords).id,
//       rating: faker.number.int({ min: 1, max: 5 }),
//       comment: faker.lorem.sentence(),
//     })),
//   });

//   // 10. Create Chats
//   const chats = await prisma.chat.createMany({
//     data: Array.from({ length: 50 }).map(() => ({
//       clientId: faker.helpers.arrayElement(clientRecords).id,
//       productId: faker.helpers.arrayElement(productRecords).id,
//       businessId: faker.helpers.arrayElement(businessRecords).id,
//       status: faker.helpers.arrayElement(['PENDING', 'RESOLVED']),
//     })),
//   });
//   const chatRecords = await prisma.chat.findMany();

//   // 11. Create Chat Messages
//   await Promise.all(
//     chatRecords.map(async (chat) => {
//       const messages = Array.from({ length: faker.number.int({ min: 1, max: 10 }) }).map(() => ({
//         chatId: chat.id,
//         message: faker.lorem.sentence(),
//         senderId: faker.helpers.arrayElement([chat.clientId, chat.businessId ?? null]),
//         createdAt: faker.date.past(),
//       }));
//       await prisma.chatMessage.createMany({ data: messages });
//     }),
//   );

//   // 12. Create KYC entries
//   await prisma.kYC.createMany({
//     data: Array.from({ length: 30 }).map(() => ({
//       status: faker.helpers.arrayElement([KycStatus.PENDING, KycStatus.VERIFIED, KycStatus.REJECTED]),
//       documentUrl: faker.internet.url(),
//       submittedAt: faker.date.past(),
//     })),
//   });

//   // 13. Create Account Recharges
//   await prisma.accountRecharge.createMany({
//     data: Array.from({ length: 50 }).map(() => ({
//       amount: faker.number.float({ min: 10, max: 1000 }),
//       method: faker.helpers.arrayElement([RechargeMethod.MTN_MONEY, RechargeMethod.AIRTEL_MONEY, RechargeMethod.ORANGE_MONEY, RechargeMethod.MPESA]),
//       origin: faker.helpers.arrayElement([Country.DRC, Country.KENYA, Country.UGANDA, Country.RWANDA, Country.BURUNDI, Country.TANZANIA]),
//     })),
//   });

//   // 14. Create Payment Transactions
//   await Promise.all(
//     orderRecords.map(async (order) => {
//       await prisma.paymentTransaction.create({
//         data: {
//           orderId: order.id,
//           status: faker.helpers.arrayElement([PaymentStatus.PENDING, PaymentStatus.COMPLETED, PaymentStatus.FAILED]),
//           method: faker.helpers.arrayElement([PaymentMethod.TOKEN, PaymentMethod.MOBILE_MONEY]),
//           amount: faker.number.float({ min: 10, max: 500 }),
//           transactionDate: faker.date.past(),
//         },
//       });
//     }),
//   );

//   // 15. Create Reposted Products
//   await prisma.repostedProduct.createMany({
//     data: Array.from({ length: 20 }).map(() => ({
//       businessId: faker.helpers.arrayElement(businessRecords).id,
//       productId: faker.helpers.arrayElement(productRecords).id,
//       earnPercentage: faker.number.float({ min: 0.001, max: 0.01 }),
//     })),
//   });

//   // 16. Create ReOwned Products
//   await prisma.reOwnedProduct.createMany({
//     data: Array.from({ length: 20 }).map(() => ({
//       businessId: faker.helpers.arrayElement(businessRecords).id,
//       productId: faker.helpers.arrayElement(productRecords).id,
//       oldOwnerId: faker.helpers.arrayElement(businessRecords).id,
//       oldPrice: faker.number.float({ min: 10, max: 100 }),
//       newPrice: faker.number.float({ min: 20, max: 200 }),
//       markupPercentage: faker.number.float({ min: 0.1, max: 0.5 }),
//       agreedViaChatId: faker.helpers.arrayElement(chatRecords).id,
//     })),
//   });

//   // 17. Create Ads
//   await prisma.ad.createMany({
//     data: Array.from({ length: 20 }).map(() => ({
//       businessId: faker.helpers.arrayElement(businessRecords).id,
//       productId: faker.helpers.arrayElement(productRecords).id,
//       price: faker.number.float({ min: 50, max: 500 }),
//       periodDays: faker.number.int({ min: 7, max: 30 }),
//     })),
//   });

//   // 18. Create Freelance Services
//   const freelanceServices = await prisma.freelanceService.createMany({
//     data: Array.from({ length: 10 }).map(() => ({
//       title: faker.commerce.productName(),
//       description: faker.commerce.productDescription(),
//       isHourly: faker.datatype.boolean(),
//       rate: faker.number.float({ min: 10, max: 100 }),
//       businessId: faker.helpers.arrayElement(businessRecords).id,
//     })),
//   });
//   const freelanceServiceRecords = await prisma.freelanceService.findMany();

//   // 19. Create Freelance Orders
//   await prisma.freelanceOrder.createMany({
//     data: Array.from({ length: 20 }).map(() => ({
//       clientId: faker.helpers.arrayElement(clientRecords).id,
//       serviceId: faker.helpers.arrayElement(freelanceServiceRecords).id,
//       status: faker.helpers.arrayElement([FreelanceStatus.PENDING, FreelanceStatus.IN_PROGRESS, FreelanceStatus.COMPLETED, FreelanceStatus.CANCELLED]),
//       quantity: faker.number.int({ min: 1, max: 10 }),
//       totalAmount: faker.number.float({ min: 50, max: 1000 }),
//       escrowAmount: faker.number.float({ min: 10, max: 500 }),
//       commissionPercent: faker.number.float({ min: 0.05, max: 0.2 }),
//     })),
//   });

//   // 20. Create Referrals
//   await prisma.referral.createMany({
//     data: Array.from({ length: 30 }).map(() => {
//       const isClientReferral = faker.datatype.boolean(); // Randomly decide if it's a client referral
//       if (isClientReferral) {
//         // Client refers another Client
//         return {
//           affiliateClientId: faker.helpers.arrayElement(clientRecords).id,
//           referredClientId: faker.helpers.arrayElement(clientRecords).id,
//           affiliateBusinessId: null,
//           referredBusinessId: null,
//           verifiedPurchase: faker.datatype.boolean(),
//         };
//       } else {
//         // Business refers another Business
//         return {
//           affiliateBusinessId: faker.helpers.arrayElement(businessRecords).id,
//           referredBusinessId: faker.helpers.arrayElement(businessRecords).id,
//           affiliateClientId: null,
//           referredClientId: null,
//           verifiedPurchase: faker.datatype.boolean(),
//         };
//       }
//     }),
//   });
// }

// main()
//   .then(async () => {
//     console.log('Seeding completed.');
//     await prisma.$disconnect();
//   })
//   .catch(async (error) => {
//     console.error('Error seeding database:', error);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
