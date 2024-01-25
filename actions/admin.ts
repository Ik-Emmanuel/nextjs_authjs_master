"use server";


// server way to get user role and user
import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export const admin = async () => {
  const role = await currentRole();

  // if user is of right role 
  if (role === UserRole.ADMIN) {
    // do the async action here 

    return { success: "Allowed Server Action!" };
  }

  // else prevent them 
  return { error: "Forbidden Server Action!" }
};
