import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker';
import { v4 as uuid } from "uuid";

export default defineEventHandler(async () => {
    /** This uploads 2000 rows into each table
     * Feel free to run this a few times!
     */
  
    /** "npm run upload" to run this script */

  const prisma = new PrismaClient()
  
  function createPurchaseRecord() {
      return {
          user_id: uuid(),
          gender: faker.person.sex(),
          location: faker.location.country(),
          age: faker.number.int({ min: 16, max: 90 }),
          purchase_value: faker.number.float({ min: 0, max: 1000, precision: 2 }),
          purchase_date: faker.date.recent({
            days: 4000
          }),
          product_name: faker.commerce.productName(),
          product_material: faker.commerce.productMaterial(),
          product_tag: faker.commerce.productAdjective()
        }
  };

  function createEmployeeSatisfactionRecord() {
    return {
          employee_id: uuid(),
          gender: faker.person.sex(),
          age: faker.number.int({ min: 16, max: 70 }),
          happiness_value: faker.number.float({ min: 0, max: 100, precision: 1 }),
          job_title: faker.person.jobTitle(),
          job_type: faker.person.jobType(),
          job_area: faker.person.jobArea(),
        }
  }

    await prisma.purchases.createMany({
      data: faker.helpers.multiple(createPurchaseRecord, { count: 2000 })
    });
  
    await prisma.employeeSatisfaction.createMany({
      data: faker.helpers.multiple(createEmployeeSatisfactionRecord, { count: 2000 })
    });
  
    return 'Success!'
});