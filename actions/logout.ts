"use server";

import { signOut } from "@/auth";

export const logout = async () => {

  // here you can perform some server stuff before logging out the user 
  await signOut();
};
