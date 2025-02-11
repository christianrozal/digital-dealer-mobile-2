import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Roles
  const managerRole = await prisma.role.create({
    data: {
      name: 'manager'
    }
  });

  const consultantRole = await prisma.role.create({
    data: {
      name: 'consultant'
    }
  });

  console.log('Created roles:', { managerRole, consultantRole });

  // Hash password for the user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Create User
  const user = await prisma.user.create({
    data: {
      name: 'Christian Rozal',
      email: 'christian@alexium.com.au',
      passwordHash: hashedPassword,
      role_id: consultantRole.id, // Assign consultant role
      slug: 'christian-rozal'
    }
  });

  console.log('Created user:', user);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 