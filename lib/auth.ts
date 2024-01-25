import {unstable_update, auth } from "@/auth";


// calling unstable_update() does not update user in session until they sign out and in again 

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
//   // unstable_update is said to be unstable check why !!!!
//   unstable_update,
// } = NextAuth({



// or use client to get user session first
// once client session is gotten then server session gets too

// import { useSession } from "next-auth/react";
// //  This is a reusable hooks that simply gets the current logged in user
// export const useCurrentUser = () => {
//   const session = useSession();

//   return session.data?.user;
// };



// server side way of getting user and roles 
export const currentUser = async () => {
 
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};
