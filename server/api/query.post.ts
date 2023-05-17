import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const body: {
      query: string;
  } = await readBody(event);
  
  const prisma = new PrismaClient();
  
  try {
    const result = await prisma.$queryRawUnsafe(`${body.query}`);
    return result;
  } catch (e) {
    throw new Error(`We couldn't generate appropriate data for this query. Error: ${e}`);
  }

});