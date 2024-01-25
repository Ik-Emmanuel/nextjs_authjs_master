import { useSession } from "next-auth/react";

//  This is a reusable hooks that simply gets the current logged in user
export const useCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
};
