import path from "path";
import shell from "shelljs";
import { writeFileSync } from "fs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generatePrismaSchema(apiFolderPath) {
  const prismaSchema = `
    generator client {
      provider = "prisma-client-js"
    }
  
    datasource db {
      provider = "sqlite"
      url      = env("DATABASE_URL")
    }
  
    model Professional {
      id        Int       @id @default(autoincrement())
      name      String
      company   Company   @relation(fields: [companyId], references: [id])
      companyId Int
      products  Product[]
    }
  
    model Company {
      id            Int            @id @default(autoincrement())
      name          String
      professionals Professional[]
    }
  
    model Product {
      id             Int           @id @default(autoincrement())
      name           String
      professional   Professional @relation(fields: [professionalId], references: [id])
      professionalId Int
    }
    
    `;

  const prismaSchemaPath = path.join(apiFolderPath, "prisma", "schema.prisma");
  shell.mkdir("-p", path.join(apiFolderPath, "prisma"));
  writeFileSync(prismaSchemaPath, prismaSchema);
  console.log(`${GREEN}Generated Prisma schema file.${RESET}`);
}
