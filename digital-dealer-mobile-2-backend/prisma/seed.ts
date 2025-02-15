import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const customers = [
    { name: 'Oliver Thompson', email: 'oliver.t@gmail.com' },
    { name: 'Isabella Martinez', email: 'isabella.m@outlook.com' },
    { name: 'William Chen', email: 'william.c@gmail.com' },
    { name: 'Charlotte Davies', email: 'charlotte.d@yahoo.com' },
    { name: 'Lucas Patel', email: 'lucas.p@gmail.com' },
    { name: 'Sophia Anderson', email: 'sophia.a@outlook.com' },
    { name: 'Henry Wilson', email: 'henry.w@gmail.com' },
    { name: 'Amelia Taylor', email: 'amelia.t@yahoo.com' },
    { name: 'Thomas O\'Connor', email: 'thomas.o@gmail.com' },
    { name: 'Mia Robertson', email: 'mia.r@outlook.com' }
  ];

  for (let i = 0; i < customers.length; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: customers[i].name,
        email: customers[i].email,
        phone: `+61412345${i.toString().padStart(3, '0')}`,
        slug: customers[i].name.toLowerCase().replace(/['\s]+/g, '-'),
        customerScans: {
          create: {
            user_id: 1, // Christian
            dealership_id: 1, // Lennock Motor Group
            dealership_brand_id: 1, // Lennock Volkswagen
            dealership_department_id: 1,
            interest_status: ['Hot', 'Warm', 'Cold'][Math.floor(Math.random() * 3)],
            interested_in: ['New Car', 'Used Car', 'Service', 'Parts'][Math.floor(Math.random() * 4)],
            follow_up_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within next 7 days
          }
        }
      }
    });
    console.log(`Created customer ${customer.name} with scan`);
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