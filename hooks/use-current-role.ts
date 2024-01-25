import { useSession } from "next-auth/react";

// client side way of getting users and roles 
//  This is a reusable hooks that simply gets the role of a current logged in users
export const useCurrentRole = () => {
  const session = useSession();

  return session.data?.user?.role;
};
