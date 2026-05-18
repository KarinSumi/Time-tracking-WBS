import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (user) {
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    console.log(token);
  }
}
main().finally(() => prisma.$disconnect());
