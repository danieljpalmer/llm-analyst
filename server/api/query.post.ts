import { PrismaClient } from '@prisma/client'
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export default defineEventHandler(async (event) => {
  const body: {
      query: string;
  } = await readBody(event);

   const prisma = new PrismaClient();

  const result = await prisma.$queryRawUnsafe(`${body.query}`);
  return result;
});