import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Get existing Lennock Motor Group dealership
  const dealership = await prisma.dealership.findFirst({
    where: {
      name: 'Lennock Motor Group'
    }
  });

  if (!dealership) {
    throw new Error('Lennock Motor Group dealership not found');
  }

  // Get existing Lennock Volkswagen brand
  const brand = await prisma.dealershipBrand.findFirst({
    where: {
      name: 'Lennock Volkswagen',
      dealership_id: dealership.id
    }
  });

  if (!brand) {
    throw new Error('Lennock Volkswagen brand not found');
  }



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
    try {
      // Check if customer already exists by email
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email: customerData.email
        }
      });

      let customer;
      if (existingCustomer) {
        console.log(`Customer ${customerData.name} already exists with ID ${existingCustomer.id}`);
        customer = existingCustomer;
      } else {
        customer = await prisma.customer.create({
          data: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            slug: customerData.name.toLowerCase().replace(/\s+/g, '-')
          }
        });
        console.log('Created new customer:', customer);
      }

      // Create two customer scans for each customer
      for (let i = 0; i < 2; i++) {
        const randomInterestStatus = interestStatuses[Math.floor(Math.random() * interestStatuses.length)];
        const randomInterestedIn = interestedInOptions[Math.floor(Math.random() * interestedInOptions.length)];
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + Math.floor(Math.random() * 14)); // Random date within next 14 days

        const customerScan = await prisma.customerScan.create({
          data: {
            customer_id: customer.id,
            user_id: 1, // Using the existing user
            dealership_id: dealership.id,
            dealership_brand_id: brand.id,
            interest_status: randomInterestStatus,
            interested_in: randomInterestedIn,
            follow_up_date: followUpDate
          }
        });
        console.log(`Created customer scan ${i + 1} for customer:`, customerScan);
      }
    } catch (error) {
      console.log(`Error processing customer ${customerData.name}:`, error);
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