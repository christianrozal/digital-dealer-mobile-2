import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient()

const customerNames = [
  'Oliver Thompson', 'Isabella Martinez', 'William Chen', 'Sophia Patel', 'James Wilson',
  'Emma Rodriguez', 'Alexander Kim', 'Ava Johnson', 'Lucas Brown', 'Mia Garcia',
  'Ethan Davis', 'Charlotte Lee', 'Daniel Taylor', 'Amelia Anderson', 'Henry Wright',
  'Sofia Nguyen', 'Benjamin Moore', 'Harper White', 'Matthew Turner', 'Elizabeth Scott',
  'David Miller', 'Victoria Clark', 'Joseph Hall', 'Grace Lewis', 'Samuel Young',
  'Chloe Walker', 'Andrew King', 'Zoe Adams', 'Christopher Baker', 'Lily Green'
];

async function main() {
  // Create Roles
  const managerRole = await prisma.role.create({
    data: { id: 1, name: 'Manager' }
  });

  const consultantRole = await prisma.role.create({
    data: { id: 2, name: 'Consultant' }
  });

  // Create Users
  const christianRozal = await prisma.user.create({
    data: {
      name: 'Christian Rozal',
      email: 'christian@alexium.com.au',
      passwordHash: await hash('password123', 10),
      role_id: managerRole.id,
      slug: 'christian-rozal'
    }
  });

  const janeDoe = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'janedoe@mail.com',
      passwordHash: await hash('password123', 10),
      role_id: consultantRole.id,
      slug: 'jane-doe'
    }
  });

  const johnSmith = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'johnsmith@mail.com',
      passwordHash: await hash('password123', 10),
      role_id: consultantRole.id,
      slug: 'john-smith'
    }
  });

  const bruceCarlson = await prisma.user.create({
    data: {
      name: 'Bruce Carlson',
      email: 'brucecarlson@mail.com',
      passwordHash: await hash('password123', 10),
      role_id: consultantRole.id,
      slug: 'bruce-carlson'
    }
  });

  // Create Dealership
  const lennockMotorGroup = await prisma.dealership.create({
    data: {
      name: 'Lennock Motor Group',
      slug: 'lennock-motor-group',
      email: 'info@lennock.com.au',
      phone: '+61261758100'
    }
  });

  // Create Brands
  const volkswagenBrand = await prisma.dealershipBrand.create({
    data: {
      name: 'Lennock Volkswagen',
      slug: 'lennock-volkswagen',
      dealership_id: lennockMotorGroup.id
    }
  });

  const nissanBrand = await prisma.dealershipBrand.create({
    data: {
      name: 'Lennock Nissan',
      slug: 'lennock-nissan',
      dealership_id: lennockMotorGroup.id
    }
  });

  const jlrBrand = await prisma.dealershipBrand.create({
    data: {
      name: 'Lennock JLR',
      slug: 'lennock-jlr',
      dealership_id: lennockMotorGroup.id
    }
  });

  // Create Departments
  const jlrNewDept = await prisma.dealershipDepartment.create({
    data: {
      name: 'Lennock JLR New',
      slug: 'lennock-jlr-new',
      dealership_brand_id: jlrBrand.id
    }
  });

  const jlrUsedDept = await prisma.dealershipDepartment.create({
    data: {
      name: 'Lennock JLR Used',
      slug: 'lennock-jlr-used',
      dealership_brand_id: jlrBrand.id
    }
  });

  // Create QR Codes for brands and departments
  const volkswagenQR = await prisma.qrCode.create({
    data: {
      dealership_brand_id: volkswagenBrand.id,
      dealershipId: lennockMotorGroup.id
    }
  });

  const nissanQR = await prisma.qrCode.create({
    data: {
      dealership_brand_id: nissanBrand.id,
      dealershipId: lennockMotorGroup.id
    }
  });

  const jlrQR = await prisma.qrCode.create({
    data: {
      dealership_brand_id: jlrBrand.id,
      dealershipId: lennockMotorGroup.id
    }
  });

  const jlrNewQR = await prisma.qrCode.create({
    data: {
      dealership_brand_id: jlrBrand.id,
      dealershipId: lennockMotorGroup.id,
      dealership_department_id: jlrNewDept.id
    }
  });

  const jlrUsedQR = await prisma.qrCode.create({
    data: {
      dealership_brand_id: jlrBrand.id,
      dealershipId: lennockMotorGroup.id,
      dealership_department_id: jlrUsedDept.id
    }
  });

  // Create UserDealershipAccess
  // Jane Doe - Volkswagen access
  await prisma.userDealershipAccess.create({
    data: {
      user_id: janeDoe.id,
      dealership_id: lennockMotorGroup.id,
      dealership_brand_id: volkswagenBrand.id
    }
  });

  // John Smith - Volkswagen access
  await prisma.userDealershipAccess.create({
    data: {
      user_id: johnSmith.id,
      dealership_id: lennockMotorGroup.id,
      dealership_brand_id: volkswagenBrand.id
    }
  });

  // Bruce Carlson - All access
  const brands = [volkswagenBrand, nissanBrand, jlrBrand];
  const departments = [jlrNewDept, jlrUsedDept];

  // Give Bruce access to all brands
  for (const brand of brands) {
    await prisma.userDealershipAccess.create({
      data: {
        user_id: bruceCarlson.id,
        dealership_id: lennockMotorGroup.id,
        dealership_brand_id: brand.id
      }
    });
  }

  // Give Bruce access to all departments
  for (const dept of departments) {
    await prisma.userDealershipAccess.create({
      data: {
        user_id: bruceCarlson.id,
        dealership_id: lennockMotorGroup.id,
        dealership_brand_id: jlrBrand.id,
        dealership_department_id: dept.id
      }
    });
  }

  // Create 30 Customers
  const customers: Prisma.CustomerGetPayload<{}>[] = [];
  for (const name of customerNames) {
    const customer = await prisma.customer.create({
      data: {
        name,
        email: name.toLowerCase().replace(' ', '.') + '@example.com',
        phone: '+614' + Math.floor(10000000 + Math.random() * 90000000),
        slug: name.toLowerCase().replace(' ', '-')
      }
    });
    customers.push(customer);
  }

  // Create CustomerScans (10 each for Jane, John, and Bruce)
  const consultants = [
    { user: janeDoe, customers: customers.slice(0, 10) },
    { user: johnSmith, customers: customers.slice(10, 20) },
    { user: bruceCarlson, customers: customers.slice(20, 30) }
  ];

  for (const { user, customers } of consultants) {
    for (const customer of customers) {
      const interestStatuses = ['Hot', 'Warm', 'Cold'];
      const interests = ['New Car', 'Used Car', 'Service', 'Parts'];
      
      await prisma.customerScan.create({
        data: {
          customer_id: customer.id,
          user_id: user.id,
          dealership_id: lennockMotorGroup.id,
          dealership_brand_id: volkswagenBrand.id,
          interest_status: interestStatuses[Math.floor(Math.random() * interestStatuses.length)],
          interested_in: interests[Math.floor(Math.random() * interests.length)],
          follow_up_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        }
      });

      // Create DealershipScan for each customer
      await prisma.dealershipScan.create({
        data: {
          qrcode_id: volkswagenQR.id,
          customer_id: customer.id,
          status: 'completed',
          submitted_at: new Date(),
          form_data: {
            name: customer.name,
            email: customer.email,
            submission_date: new Date().toISOString()
          }
        }
      });
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 