import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create consultant and manager roles
  const consultantRole = await prisma.role.create({
    data: {
      name: 'consultant'
    }
  });
  console.log('Created consultant role:', consultantRole);

  const managerRole = await prisma.role.create({
    data: {
      name: 'manager'
    }
  });
  console.log('Created manager role:', managerRole);

  // Create user Christian Rozal as consultant
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Christian Rozal',
      email: 'christian@alexium.com.au',
      phone: '+639123456789',
      passwordHash: hashedPassword,
      role_id: consultantRole.id,
      slug: 'christian-rozal'
    }
  });
  console.log('Created user:', user);

  // Create Lennock Motor Group dealership
  const dealership = await prisma.dealership.create({
    data: {
      name: 'Lennock Motor Group',
      slug: 'lennock-motor-group'
    }
  });
  console.log('Created dealership:', dealership);

  // Create dealership brands
  const volkswagen = await prisma.dealershipBrand.create({
    data: {
      name: 'Lennock Volkswagen',
      slug: 'lennock-volkswagen',
      dealership_id: dealership.id
    }
  });
  console.log('Created Volkswagen brand:', volkswagen);

  const nissan = await prisma.dealershipBrand.create({
    data: {
      name: 'Lennock Nissan',
      slug: 'lennock-nissan',
      dealership_id: dealership.id
    }
  });
  console.log('Created Nissan brand:', nissan);

  const jlr = await prisma.dealershipBrand.create({
    data: {
      name: 'Lennock JLR',
      slug: 'lennock-jlr',
      dealership_id: dealership.id
    }
  });
  console.log('Created JLR brand:', jlr);

  // Create JLR departments
  const jlrNew = await prisma.dealershipDepartment.create({
    data: {
      name: 'Lennock JLR New',
      slug: 'lennock-jlr-new',
      dealership_brand_id: jlr.id
    }
  });
  console.log('Created JLR New department:', jlrNew);

  const jlrUsed = await prisma.dealershipDepartment.create({
    data: {
      name: 'Lennock JLR Used',
      slug: 'lennock-jlr-used',
      dealership_brand_id: jlr.id
    }
  });
  console.log('Created JLR Used department:', jlrUsed);

  // Create 10 random customers
  const customers = [
    { name: 'John Smith', email: 'john.smith@email.com', phone: '0412345678' },
    { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '0423456789' },
    { name: 'Michael Chen', email: 'michael.c@email.com', phone: '0434567890' },
    { name: 'Emma Wilson', email: 'emma.w@email.com', phone: '0445678901' },
    { name: 'David Brown', email: 'david.b@email.com', phone: '0456789012' },
    { name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '0467890123' },
    { name: 'James Taylor', email: 'james.t@email.com', phone: '0478901234' },
    { name: 'Sophie Martin', email: 'sophie.m@email.com', phone: '0489012345' },
    { name: 'Robert Lee', email: 'robert.l@email.com', phone: '0490123456' },
    { name: 'Jessica White', email: 'jessica.w@email.com', phone: '0401234567' }
  ];

  const interestStatuses = ['Hot', 'Warm', 'Cold'];
  const interestedInOptions = ['Buying', 'Selling', 'Financing'];

  for (const customerData of customers) {
    const customer = await prisma.customer.create({
      data: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        slug: customerData.name.toLowerCase().replace(/\s+/g, '-')
      }
    });
    console.log('Created customer:', customer);

    // Create two customer scans for each customer (all in Lennock Volkswagen)
    for (let i = 0; i < 2; i++) {
      const randomInterestStatus = interestStatuses[Math.floor(Math.random() * interestStatuses.length)];
      const randomInterestedIn = interestedInOptions[Math.floor(Math.random() * interestedInOptions.length)];
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + Math.floor(Math.random() * 14)); // Random date within next 14 days

      const customerScan = await prisma.customerScan.create({
        data: {
          customer_id: customer.id,
          user_id: user.id,
          dealership_id: dealership.id,
          dealership_brand_id: volkswagen.id,
          interest_status: randomInterestStatus,
          interested_in: randomInterestedIn,
          follow_up_date: followUpDate
        }
      });
      console.log(`Created customer scan ${i + 1} for customer:`, customerScan);
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 