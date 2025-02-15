import { Response, RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '../types/auth'
import { Request } from 'express'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
const prisma = new PrismaClient()

export const getCustomerScansByUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
) => {
  try {
    const userId = parseInt(req.params.userId);
    const brandId = req.query.brandId ? parseInt(req.query.brandId as string) : undefined;
    const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
    const searchQuery = req.query.search ? String(req.query.search) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const interestStatus = req.query.interestStatus ? 
      (Array.isArray(req.query.interestStatus) ? req.query.interestStatus : [req.query.interestStatus]) : 
      undefined;
    const interestedIn = req.query.interestedIn ? 
      (Array.isArray(req.query.interestedIn) ? req.query.interestedIn : [req.query.interestedIn]) : 
      undefined;

    // First, get the latest scan IDs for each customer
    const latestScans = await prisma.customerScan.findMany({
      where: {
        user_id: userId,
        dealership_brand_id: brandId,
        ...(departmentId && { dealership_department_id: departmentId })
      },
      orderBy: {
        created_at: 'desc'
      },
      distinct: ['customer_id'],
      select: {
        id: true,
        customer_id: true,
        interest_status: true,
        interested_in: true
      }
    });

    // Filter latest scans based on interest status and interested in
    const filteredCustomerIds = latestScans
      .filter(scan => {
        const matchesStatus = !interestStatus || interestStatus.includes(scan.interest_status);
        const matchesInterest = !interestedIn || interestedIn.includes(scan.interested_in || '');
        return matchesStatus && matchesInterest;
      })
      .map(scan => scan.customer_id);

    // Get total count for pagination
    const totalCount = await prisma.customer.count({
      where: {
        id: {
          in: filteredCustomerIds
        },
        ...(searchQuery && {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phone: { contains: searchQuery, mode: 'insensitive' } }
          ]
        })
      }
    });

    // Get paginated customers with their latest scans
    const customersWithScans = await prisma.customer.findMany({
      where: {
        id: {
          in: filteredCustomerIds
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
    });

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
    });

    return res.json({
      customers: formattedCustomers,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching unique customers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

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
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserScans = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const {
      brandId,
      departmentId,
      fromDate,
      toDate,
      interestedIn,
      interestStatus,
      sortBy,
    } = req.query;

    // Convert string dates to Date objects and handle timezone
    const startDate = fromDate ? dayjs(fromDate as string).startOf('day').toDate() : dayjs().startOf('day').toDate();
    const endDate = toDate ? dayjs(toDate as string).endOf('day').toDate() : dayjs().endOf('day').toDate();

    // Build the orderBy configuration based on sortBy
    let orderBy: any[] = [];
    switch (sortBy) {
      case 'a_to_z':
        orderBy = [{ customer: { name: 'asc' } }];
        break;
      case 'z_to_a':
        orderBy = [{ customer: { name: 'desc' } }];
        break;
      case 'last_scanned_oldest_to_newest':
        orderBy = [{ created_at: 'asc' }];
        break;
      case 'last_scanned_newest_to_oldest':
      default:
        orderBy = [{ created_at: 'desc' }];
        break;
    }

    // Parse array values from query params
    const interestInArray = interestedIn ? 
      (Array.isArray(interestedIn) ? interestedIn : [interestedIn]).map(String) : 
      undefined;
    
    const interestStatusArray = interestStatus ? 
      (Array.isArray(interestStatus) ? interestStatus : [interestStatus]).map(String) : 
      undefined;

    // Base query with all filters
    const scans = await prisma.customerScan.findMany({
      where: {
        user_id: userId,
        dealership_brand_id: parseInt(brandId as string),
        dealership_department_id: departmentId ? parseInt(departmentId as string) : undefined,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        ...(interestInArray && {
          interested_in: {
            in: interestInArray,
          },
        }),
        ...(interestStatusArray && {
          interest_status: {
            in: interestStatusArray,
          },
        }),
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            profile_image_url: true,
          },
        },
      },
      orderBy,
    });

    res.json(scans);
  } catch (error) {
    console.error('Error fetching user scans:', error);
    return res.status(500).json({ error: 'Failed to fetch user scans' });
  }
};

export const getCustomerLogs = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    const customerLogs = await prisma.customerScan.findMany({
      where: {
        customer_id: parseInt(customerId)
      },
      include: {
        customer: true,
        dealership: true,
        dealershipBrand: true,
        dealershipDepartment: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(customerLogs);
  } catch (error) {
    console.error('Error fetching customer logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { name, email, phone } = req.body;

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: parseInt(customerId)
      },
      data: {
        name,
        email,
        phone
      }
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCustomerScan = async (req: Request, res: Response) => {
  try {
    const { scanId } = req.params;
    const { interest_status, interested_in, follow_up_date } = req.body;

    const updatedScan = await prisma.customerScan.update({
      where: {
        id: parseInt(scanId)
      },
      data: {
        interest_status,
        interested_in,
        follow_up_date: follow_up_date ? new Date(follow_up_date) : null
      }
    });

    res.json(updatedScan);
  } catch (error) {
    console.error('Error updating customer scan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCustomerScan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customer_id,
      user_id,
      dealership_brand_id,
      dealership_department_id,
      interest_status,
      interested_in,
      follow_up_date
    } = req.body;

    // Validate required fields
    if (!customer_id || !user_id || !dealership_brand_id) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'customer_id, user_id, and dealership_brand_id are required'
      });
    }

    // Get the dealership_id from the brand
    const brand = await prisma.dealershipBrand.findUnique({
      where: { id: dealership_brand_id },
      select: { dealership_id: true }
    });

    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found',
        details: `No brand found with ID ${dealership_brand_id}`
      });
    }

    // Create the customer scan
    const customerScan = await prisma.customerScan.create({
      data: {
        customer_id: parseInt(customer_id.toString()),
        user_id: parseInt(user_id.toString()),
        dealership_id: brand.dealership_id,
        dealership_brand_id: parseInt(dealership_brand_id.toString()),
        dealership_department_id: dealership_department_id ? parseInt(dealership_department_id.toString()) : null,
        interest_status: interest_status || 'hot',
        interested_in: interested_in || 'buying',
        follow_up_date: follow_up_date ? new Date(follow_up_date) : null
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            profile_image_url: true
          }
        },
        dealership: true,
        dealershipBrand: true,
        dealershipDepartment: true
      }
    });

    return res.status(201).json(customerScan);
  } catch (error) {
    console.error('Error creating customer scan:', error);
    return res.status(500).json({ 
      error: 'Failed to create customer scan',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 