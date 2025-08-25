import { Injectable } from '@nestjs/common';
import { CreateBusinessInput } from './dto/create-business.input';
import { UpdateBusinessInput } from './dto/update-business.input';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'argon2';
import { BusinessDashboardResponse, DashboardStats, RecentOrder, SalesDataPoint } from './dto/business-dashboard.dto';
import { format, subDays, startOfDay, endOfDay, isAfter, isBefore, startOfWeek, endOfWeek, addDays } from 'date-fns';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async create(createBusinessInput: CreateBusinessInput) {
    const { password, ...businessData } = createBusinessInput;
    const hashedPassword = await hash(password);

    return this.prisma.business.create({
      data: {
        ...businessData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        avatar: true,
        coverImage: true,
        address: true,
        phone: true,
        isVerified: true,
        isB2BEnabled:true,
        kycStatus:true,
        hasAgreedToTerms:true,
        totalProductsSold:true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.business.findMany({
      include: {
        products: { select: { id: true, title: true, price: true, stock: true, createdAt: true } },
        workers: { select: { id: true, email: true, fullName: true, role: true, createdAt: true } },
        repostedItems: { select: { id: true, markupPercentage: true, createdAt: true } },
        reownedItems: { select: { id: true, oldPrice: true, newPrice: true, markupPercentage: true, createdAt: true } },
        recharges: { select: { id: true, amount: true, method: true, createdAt: true } },
        ads: { select: { id: true, price: true, periodDays: true, createdAt: true, endedAt: true } },
        freelanceServices: { select: { id: true, title: true, isHourly: true, rate: true, createdAt: true } },
        referralsMade: { select: { id: true, verifiedPurchase: true, createdAt: true } },
        referralsReceived: { select: { id: true, verifiedPurchase: true, createdAt: true } },
        chatParticipants: { select: {chat : { select: { id: true, status: true, createdAt: true, updatedAt: true } } } },
        postOfSales: { select: { id: true, title: true, price: true, status: true, createdAt: true } },
        kyc: { select: { id: true, status: true, submittedAt: true, verifiedAt: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.business.findUnique({
      where: { id },
      include: {
        products: { 
          select: { 
            id: true, 
            title: true, 
            price: true, 
            quantity: true,
            // minQuantity: true,
            createdAt: true 
          } 
        },
        workers: { 
          select: { 
            id: true, 
            email: true, 
            fullName: true, 
            role: true, 
            createdAt: true 
          } 
        },
        repostedItems: { 
          select: { 
            id: true, 
            markupPercentage: true, 
            createdAt: true,
            product: {
              select: {
                title: true,
                price:true,
                medias :{
                  select: {
                    url: true,
                  },
                  take:1
                }
              }
            }
          } 
        },
        reownedItems: { 
          select: { 
            id: true, 
            oldPrice: true, 
            newPrice: true, 
            markupPercentage: true, 
            createdAt: true,
            newProduct: {
              select: {
                title: true,
                price:true,
                medias :{
                  select: {
                    url: true,
                  },
                  take:1
                }
              }
            }
          } 
        },
        recharges: { 
          select: { 
            id: true, 
            amount: true, 
            method: true, 
            createdAt: true 
          } 
        },
        ads: { 
          select: { 
            id: true, 
            price: true, 
            periodDays: true, 
            createdAt: true, 
            endedAt: true,
            product: {
              select: {
                title: true,
                medias :{
                  select: {
                    url: true,
                  },
                  take:1
                }
              }
            }
          } 
        },
        freelanceServices: { 
          select: { 
            id: true, 
            title: true, 
            isHourly: true, 
            rate: true, 
            createdAt: true,
            category: true
          } 
        },
        referralsMade: { 
          select: { 
            id: true, 
            verifiedPurchase: true, 
            createdAt: true,
            referredClient: {
              select: {
                fullName: true
              }
            }
          } 
        },
        referralsReceived: { 
          select: { 
            id: true, 
            verifiedPurchase: true, 
            createdAt: true,
            affiliateClient: {
              select: {
                fullName: true
              }
            }
          } 
        },
        chatParticipants: { 
          select: { 
            chat: { 
              select: { 
                id: true, 
                status: true, 
                createdAt: true, 
                updatedAt: true,
                
                product: {
                  select: {
                    title: true
                  }
                }
              } 
            },
            client: {
              select: {
                fullName: true,
                avatar: true
              }
            },
          } 
        },
        postOfSales: { 
          select: { 
            id: true, 
            title: true, 
            price: true, 
            status: true, 
            createdAt: true,
            media: {
              take: 1,
              select: {
                url: true
              }
            }
          } 
        },
        kyc: { 
          select: { 
            id: true, 
            status: true, 
            submittedAt: true, 
            verifiedAt: true 
          } 
        },
        stores: {
          select: {
            id: true,
            name: true,
            address: true,
            createdAt: true
          }
        },
        loyaltyPrograms: {
          select: {
            id: true,
            name: true,
            pointsPerPurchase: true,
            // minimumPointsToRedeem: true,
            createdAt: true
          }
        }
      },
    });
  }

  async updateTotalProuctSold(id: string, data: { totalProductsSold?: { increment: number } }) {
    await this.prisma.business.update({
      where : { id },
      data
    })
  }

  async update(id: string, updateBusinessInput: UpdateBusinessInput) {
    const { password, kycId, ...businessData } = updateBusinessInput;
    const data: any = { ...businessData };

    if (password) {
      data.password = await hash(password);
    }
    if (kycId) {
      data.kyc = { connect: { id: kycId } };
    }

    return this.prisma.business.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        avatar: true,
        coverImage: true,
        address: true,
        phone: true,
        isVerified: true,
        isB2BEnabled:true,
        kycStatus:true,
        hasAgreedToTerms:true,
        totalProductsSold:true,
        createdAt: true,
        updatedAt: true,
        kyc: { select: { id: true, status: true } },
      },  
    });
  }

  async remove(id: string) {
    return this.prisma.business.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async verifyBusinessAccess(businessId: string | undefined | null, user: { id: string; role: string }) {
    const business = this.findOne(user.id)

    if (!business) {
      throw new Error('Worker can only access stores of their business');
    }
  
    return true;
  }


  async getBusinessDashboard(businessId: string): Promise<BusinessDashboardResponse> {
    // Get stats
    const stats = await this.getDashboardStats(businessId);
    
    // Get sales data for the last 7 days
    const salesData = await this.getSalesData(businessId);
    
    // Get recent orders
    const recentOrders = await this.getRecentOrders(businessId);
    
    return {
      stats,
      salesData,
      recentOrders,
    };
  }

  private async getDashboardStats(businessId: string): Promise<DashboardStats> {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
    const startOfPreviousWeek = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    const endOfPreviousWeek = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });

    // Revenue calculations
    const [currentPeriodRevenue, previousPeriodRevenue] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          products: {
            some : {
              product : {
                businessId
              }
            }
          },
          payment: {
            status : "COMPLETED"
          },
          createdAt: {
            gte: startOfCurrentWeek,
            lte: endOfCurrentWeek,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          products: {
            some : {
              product : {
                businessId
              }
            }
          },
          payment: {
            status : "COMPLETED"
          },
          createdAt: {
            gte: startOfPreviousWeek,
            lte: endOfPreviousWeek,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const totalRevenue = currentPeriodRevenue._sum.totalAmount || 0;
    const revenueChange = previousPeriodRevenue._sum.totalAmount 
      ? ((totalRevenue - previousPeriodRevenue._sum.totalAmount) / previousPeriodRevenue._sum.totalAmount) * 100 
      : 100;

    // Orders calculations
    const [currentPeriodOrders, previousPeriodOrders] = await Promise.all([
      this.prisma.order.count({
        where: {
          products: {
            some : {
              product : {
                businessId
              }
            }
          },
          payment: {
            status : "COMPLETED"
          },
          createdAt: {
            gte: startOfCurrentWeek,
            lte: endOfCurrentWeek,
          },
        },
      }),
      this.prisma.order.count({
        where: {
          products: {
            some : {
              product : {
                businessId
              }
            }
          },
          payment: {
            status : "COMPLETED"
          },
          createdAt: {
            gte: startOfPreviousWeek,
            lte: endOfPreviousWeek,
          },
        },
      }),
    ]);

    const totalOrders = currentPeriodOrders;
    const ordersChange = previousPeriodOrders 
      ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100 
      : 100;

    // Product calculations
    const [totalProducts, lowStockProducts] = await Promise.all([
      this.prisma.product.count({
        where: {
          businessId,
        },
      }),
      this.prisma.product.count({
        where: {
          businessId,
          quantity: {
            lt: 10, // Assuming 10 as the low stock threshold
          },
        },
      }),
    ]);

    // Message calculations
    const [unreadMessages, totalMessages] = await Promise.all([
      this.prisma.chatMessage.count({
        where: {
          chat: {
            participants: {
              some: {
                businessId,
              },
            },
          },
          isRead: false,
        },
      }),
      this.prisma.chatMessage.count({
        where: {
          chat: {
            participants: {
              some: {
                businessId,
              },
            },
          },
        },
      }),
    ]);

    return {
      totalRevenue,
      revenueChange,
      totalOrders,
      ordersChange,
      totalProducts,
      lowStockProducts,
      unreadMessages,
      totalMessages,
    };
  }

  private async getSalesData(businessId: string): Promise<SalesDataPoint[]> {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    
    // Get daily sales for the last 7 days
    const dailySales = await this.prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        products: {
          some : {
            product : {
              businessId
            }
          }
        },
        payment: {
          status : "COMPLETED"
        },
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    // Format the data for the chart
    const salesData: SalesDataPoint[] = [];
    let currentDate = new Date(sevenDaysAgo);
    
    while (isBefore(currentDate, today) || isAfter(currentDate, sevenDaysAgo)) {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      const daySales = dailySales.find(s => s.createdAt === currentDate);
      
      salesData.push({
        date: format(currentDate, 'EEE'), // Short day name (Mon, Tue, etc.)
        sales: daySales && daySales._sum?.totalAmount ? daySales._sum?.totalAmount : 0,
      });
      
      currentDate = addDays(currentDate, 1);
    }
    
    return salesData;
  }

  private async getRecentOrders(businessId: string): Promise<RecentOrder[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        products: {
          some : {
            product : {
              businessId
            }
          }
        },
        payment: {
          status : "COMPLETED"
        },
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: {
          select: {
            fullName: true,
          },
        },
        payment:{
          select: { status: true }
        }
      },
    });
    
    return orders.map(order => ({
      id: order.id,
      client: {
        fullName: order?.client?.fullName ? order.client.fullName : "Client",
      },
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      status: order?.payment?.status ? order?.payment?.status : "No Status",
    }));
  }

}
