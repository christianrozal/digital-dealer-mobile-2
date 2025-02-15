import { PrismaClient } from '@prisma/client';
import { withPulse } from '@prisma/extension-pulse';
import dotenv from "dotenv"

process.on('SIGINT', () => {
  process.exit(0);
});

dotenv.config();
const apiKey: string = process.env.PULSE_API_KEY ?? '';
if (!apiKey || apiKey === "") {
  console.log(`Please set the \`PULSE_API_KEY\` environment variable in the \`.env\` file.`);
  process.exit(1);
}

const prisma = new PrismaClient().$extends(
  withPulse({ apiKey: apiKey })
);

async function main() {
  // Set up stream for notifications
  const notificationStream = await prisma.notification.stream();

  process.on('exit', () => {
    notificationStream.stop();
  });

  console.log(`Pulse stream initialized. Waiting for notification events...`);
  
  // Handle notification events
  for await (const event of notificationStream) {
    if ('action' in event && event.action === 'create') {
      console.log('New notification created:', event.record);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
