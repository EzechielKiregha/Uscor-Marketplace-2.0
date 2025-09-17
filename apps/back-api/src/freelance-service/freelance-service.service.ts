import { Injectable } from '@nestjs/common'
import {
  AssignWorkersInput,
  CreateFreelanceServiceInput,
  FreelanceServiceCategory,
} from './dto/create-freelance-service.input'
import { UpdateFreelanceServiceInput } from './dto/update-freelance-service.input'
import { PrismaService } from '../prisma/prisma.service'

interface FindAllFilters {
  category?: string
  minRate?: number
  maxRate?: number
  isHourly?: boolean
  businessId?: string
  search?: string
  page?: number
  limit?: number
}

interface AssignWorkerToServiceInput {
  serviceId: string
  workerId: string
  role?: string
}

// Service
@Injectable()
export class FreelanceServiceService {
  constructor(private prisma: PrismaService) {}

  async create(
    createFreelanceServiceInput: CreateFreelanceServiceInput,
    businessId: string,
  ) {
    const {
      title,
      description,
      isHourly,
      rate,
      category,
      workerIds,
    } = createFreelanceServiceInput
    return this.prisma.freelanceService.create({
      data: {
        title,
        description,
        isHourly,
        rate,
        category,
        business: { connect: { id: businessId } },
        workerServiceAssignments: {
          create: workerIds?.map((workerId) => ({
            worker: { connect: { id: workerId } },
          })),
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            createdAt: true,
          },
        },
        workerServiceAssignments: {
          include: {
            worker: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async findAll(filters: FindAllFilters) {
    const {
      category,
      minRate,
      maxRate,
      isHourly,
      businessId,
      search,
      page = 1,
      limit = 20,
    } = filters

    const skip = (page - 1) * limit

    const where: any = {}

    if (
      category &&
      Object.values(
        FreelanceServiceCategory,
      ).includes(
        category as FreelanceServiceCategory,
      )
    ) {
      where.category = category
    }

    if (minRate !== undefined) {
      where.rate = { ...where.rate, gte: minRate }
    }

    if (maxRate !== undefined) {
      where.rate = { ...where.rate, lte: maxRate }
    }

    if (isHourly !== undefined) {
      where.isHourly = isHourly
    }

    if (businessId) {
      where.businessId = businessId
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      this.prisma.freelanceService.findMany({
        where,
        skip,
        take: limit,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true,
              createdAt: true,
            },
          },
          workerServiceAssignments: {
            include: {
              worker: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.freelanceService.count({
        where,
      }),
    ])

    // console.log("Services: ",{ items, total })

    return {
      items,
      total,
      page,
      limit,
    }
  }

  async findOne(id: string) {
    const service =
      await this.prisma.freelanceService.findUnique(
        {
          where: { id },
          include: {
            business: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
                createdAt: true,
              },
            },
            workerServiceAssignments: {
              include: {
                worker: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      )
    if (!service) {
      throw new Error(
        'Freelance service not found',
      )
    }
    return service
  }

  async update(
    id: string,
    updateFreelanceServiceInput: UpdateFreelanceServiceInput,
    businessId: string,
  ) {
    const {
      title,
      description,
      isHourly,
      rate,
      workerIds,
    } = updateFreelanceServiceInput
    const service = await this.findOne(id)
    if (service.businessId !== businessId) {
      throw new Error(
        'Businesses can only update their own services',
      )
    }
    return this.prisma.freelanceService.update({
      where: { id },
      data: {
        title,
        description,
        isHourly,
        rate,
        workerServiceAssignments: workerIds
          ? {
              deleteMany: {},
              create: workerIds.map(
                (workerId) => ({
                  worker: {
                    connect: { id: workerId },
                  },
                }),
              ),
            }
          : undefined,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        workerServiceAssignments: {
          include: {
            worker: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async assignWorkers(
    assignWorkersInput: AssignWorkersInput,
    businessId: string,
  ) {
    const { serviceId, workerIds } =
      assignWorkersInput
    const service = await this.findOne(serviceId)
    if (service.businessId !== businessId) {
      throw new Error(
        'Businesses can only assign workers to their own services',
      )
    }
    return this.prisma.freelanceService.update({
      where: { id: serviceId },
      data: {
        workerServiceAssignments: {
          deleteMany: {},
          create: workerIds.map((workerId) => ({
            worker: { connect: { id: workerId } },
          })),
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        workerServiceAssignments: {
          include: {
            worker: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async assignWorkerToService(
    input: AssignWorkersInput,
    businessId: string,
  ) {
    const { serviceId, workerIds, role } = input
    const service = await this.findOne(serviceId)
    if (service.businessId !== businessId) {
      throw new Error(
        'Businesses can only assign workers to their own services',
      )
    }

    return this.prisma.workerServiceAssignment.create(
      {
        data: {
          freelanceService: {
            connect: { id: serviceId },
          },
          worker: { connect: { id: workerIds[0] } },
          role,
        },
        include: {
          worker: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          freelanceService: {
            select: { id: true, title: true },
          },
        },
      },
    )
  }

  async getWorkerAssignments(
    workerId: string,
    serviceId?: string,
  ) {
    const where: any = { workerId }
    if (serviceId) {
      where.freelanceServiceId = serviceId
    }

    return this.prisma.workerServiceAssignment.findMany(
      {
        where,
        include: {
          worker: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          freelanceService: {
            select: { id: true, title: true },
          },
        },
      },
    )
  }

  async remove(id: string, businessId: string) {
    const service = await this.findOne(id)
    if (service.businessId !== businessId) {
      throw new Error(
        'Businesses can only delete their own services',
      )
    }
    return this.prisma.freelanceService.delete({
      where: { id },
      select: { id: true, title: true },
    })
  }
}
