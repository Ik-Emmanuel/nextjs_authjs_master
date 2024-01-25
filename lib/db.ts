import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// checks if there is an existing client else create one
//next hot reload will keep initializing new client 
//  global is not affected by hot reload 
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;