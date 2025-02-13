import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '../types/auth'
import { Request } from 'express'

const prisma = new PrismaClient()

export const getCustomerScansByUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = parseInt(req.params.userId)
    const brandId = req.query.brandId ? parseInt(req.query.brandId as string) : undefined
    const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined

    const customerScans = await prisma.customerScan.findMany({
      where: {
        user_id: userId,
        dealership_brand_id: brandId,
        ...(departmentId && { dealership_department_id: departmentId })
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            profile_image_url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return res.json(customerScans)
  } catch (error) {
    console.error('Error fetching customer scans:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUniqueCustomers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = parseInt(req.params.userId)
    const brandId = req.query.brandId ? parseInt(req.query.brandId as string) : undefined
    const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined
    const searchQuery = req.query.search ? String(req.query.search) : undefined
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10

    // First, get total count for pagination
    const totalCount = await prisma.customer.count({
      where: {
        customerScans: {
          some: {
            user_id: userId,
            dealership_brand_id: brandId,
            ...(departmentId && { dealership_department_id: departmentId })
          }
        },
        ...(searchQuery && {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phone: { contains: searchQuery, mode: 'insensitive' } }
          ]
        })
      }
    })

    // Then, get paginated customers with their scans
    const customersWithScans = await prisma.customer.findMany({
      where: {
        customerScans: {
          some: {
            user_id: userId,
            dealership_brand_id: brandId,
            ...(departmentId && { dealership_department_id: departmentId })
          }
        },
        ...(searchQuery && {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phone: { contains: searchQuery, mode: 'insensitive' } }
          ]
        })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profile_image_url: true,
        customerScans: {
          where: {
            user_id: userId,
            dealership_brand_id: brandId,
            ...(departmentId && { dealership_department_id: departmentId })
          },
          orderBy: {
            created_at: 'desc'
          },
          select: {
            id: true,
            created_at: true,
            interest_status: true,
            interested_in: true
          }
        },
        _count: {
          select: {
            customerScans: {
              where: {
                user_id: userId,
                dealership_brand_id: brandId,
                ...(departmentId && { dealership_department_id: departmentId })
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Transform the data to match the frontend's expected format
    const formattedCustomers = customersWithScans.map(customer => {
      const latestScan = customer.customerScans[0] // Already ordered by created_at desc
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        profileImage: customer.profile_image_url,
        lastScanned: latestScan?.created_at,
        lastScanId: latestScan?.id.toString(),
        scanCount: customer._count.customerScans,
        interestStatus: latestScan?.interest_status,
        interestedIn: latestScan?.interested_in
      }
    })

    return res.json({
      customers: formattedCustomers,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching unique customers:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getCustomerScanDetails = async (
  req: Request<{ customerId: string; scanId: string }>,
  res: Response
) => {
  try {
    const { customerId, scanId } = req.params;

    const [customerScan, scanCount] = await Promise.all([
      prisma.customerScan.findFirst({
        where: {
          id: parseInt(scanId),
          customer_id: parseInt(customerId)
        },
        include: {
          customer: true,
          dealership: true,
          dealershipBrand: true,
          dealershipDepartment: true
        }
      }),
      prisma.customerScan.count({
        where: {
          customer_id: parseInt(customerId)
        }
      })
    ]);

    if (!customerScan) {
      return res.status(404).json({ message: 'Customer scan not found' });
    }

    res.json({
      ...customerScan,
      scanCount
    });
  } catch (error) {
    console.error('Error fetching customer scan details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 