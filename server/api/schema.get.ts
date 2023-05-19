import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  
  try {
    const schema = Prisma.dmmf.datamodel.models;
    return schema;
  } catch (e) {
    throw new Error(`Error: ${e}`);
  }

});