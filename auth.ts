import NextAuth from "next-auth"
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",

    // this is where every other error that could happen during sign in goes 
    error: "/auth/error",
  },

  // Events are asynchronous functions that done report any response, used for eg logging, reporting or other side effects
  // eg signIn or Signout events
  events: {

    // linkAccount is a special nextevent so we perform some action when that is called 
    // when called auto set emailverified column
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
    // asynchronous function use to controll what happens when an action is performed

    // When sign in is performed
    //  used to check even if a user is signed in wether you want them in or not  more powerful than doing so in the login actions 
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);

      // Prevent sign (through API for sure that email must be verified ) in until email verification
      //  double check even though login in action checks this too 
      if (!existingUser?.emailVerified) return false;

      // check if user opts for 2-step verification  and send token after sign in 
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
        
        // wait 
        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id }
        });
      }

      return true;
    },

    // When session is accessed
    // when const session = await auth(); is called 
    //  must extend token before you can extend session 
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isOAuth = token.isOAuth as boolean;
      }

      // always return back 
      return session;
    },

    // When session token is called for
    // whenever we have a logged in user we must have a token associated with them  we use this
    //  to  get and extend session data
    // token.sub = user's id or console.log(token) to confirm

    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(
        existingUser.id
      );
      
      //  token.customfield = value  // this adds the value to the token  accessible now by session 
      //  session.user?.newfiled = token.customfield;
      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      
      // always return back 
      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
