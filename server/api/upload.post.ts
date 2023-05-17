import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker';
import { v4 as uuid } from "uuid";

export default defineEventHandler(async () => {
    const prisma = new PrismaClient()
    await prisma.purchaseHistory.createMany({
      data: Array.apply(null, Array(1000)).map(_ => {
        return {
          user_id: uuid(),
          gender: faker.person.gender(),
          location: faker.location.country(),
          age: faker.number.int({ min: 16, max: 90 }),
          purchase_value: faker.number.float({ min: 0, max: 1000, precision: 2 }),
          total_spend: faker.number.float({ min: 0, max: 300000, precision: 2 }),
          purchase_date: faker.date.recent({
            days: 2000
          })
        }
      })
    });
    return 'Success!'
});