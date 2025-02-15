import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDuplicates() {
  // Find customers with duplicate emails
  const duplicateEmails = await prisma.$queryRaw<{ email: string, count: number }[]>`
    SELECT email, COUNT(*) as count
    FROM "Customer"
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  `;

  console.log('Found customers with duplicate emails:', duplicateEmails);

  // For each duplicate email
  for (const { email } of duplicateEmails) {
    // Get all customers with this email, ordered by creation date
    const customers = await prisma.customer.findMany({
      where: { email },
      orderBy: { created_at: 'desc' },
      include: {
        customerScans: true,
        dealershipScans: true,
        appointments: true,
        customerLogs: true
      }
    });

    console.log(`\nProcessing ${customers.length} duplicates for email: ${email}`);
    
    // Keep the most recent record and delete others
    const [mostRecent, ...duplicates] = customers;
    
    console.log('Most recent record:', {
      id: mostRecent.id,
      name: mostRecent.name,
      email: mostRecent.email,
      created_at: mostRecent.created_at
    });

    // For each duplicate
    for (const duplicate of duplicates) {
      console.log('Processing duplicate:', {
        id: duplicate.id,
        name: duplicate.name,
        email: duplicate.email,
        created_at: duplicate.created_at
      });

      // Move all relations to the most recent record
      if (duplicate.customerScans.length > 0) {
        await prisma.customerScan.updateMany({
          where: { customer_id: duplicate.id },
          data: { customer_id: mostRecent.id }
        });
      }

      if (duplicate.dealershipScans.length > 0) {
        await prisma.dealershipScan.updateMany({
          where: { customer_id: duplicate.id },
          data: { customer_id: mostRecent.id }
        });
      }

      if (duplicate.appointments.length > 0) {
        await prisma.appointment.updateMany({
          where: { customer_id: duplicate.id },
          data: { customer_id: mostRecent.id }
        });
      }

      if (duplicate.customerLogs.length > 0) {
        await prisma.customerLog.updateMany({
          where: { customer_id: duplicate.id },
          data: { customer_id: mostRecent.id }
        });
      }

      // Delete the duplicate record
      await prisma.customer.delete({
        where: { id: duplicate.id }
      });

      console.log(`Deleted duplicate record with ID: ${duplicate.id}`);
    }
  }

  // Find customers with duplicate slugs
  const duplicateSlugs = await prisma.$queryRaw<{ slug: string, count: number }[]>`
    SELECT slug, COUNT(*) as count
    FROM "Customer"
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
  `;

  console.log('\nFound customers with duplicate slugs:', duplicateSlugs);

  // Handle duplicate slugs by appending a number
  for (const { slug } of duplicateSlugs) {
    const customers = await prisma.customer.findMany({
      where: { slug },
      orderBy: { created_at: 'asc' }
    });

    // Keep the original slug for the first record
    const [first, ...others] = customers;
    
    // Update others with a numbered suffix
    for (let i = 0; i < others.length; i++) {
      const newSlug = `${slug}-${i + 2}`;
      await prisma.customer.update({
        where: { id: others[i].id },
        data: { slug: newSlug }
      });
      console.log(`Updated customer ${others[i].id} slug to: ${newSlug}`);
    }
  }
}

findDuplicates()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 