"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { 
  sendVerificationEmail,
  sendTwoFactorTokenEmail,
} from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { 
  generateVerificationToken,
  generateTwoFactorToken
} from "@/lib/tokens";
import { 
  getTwoFactorConfirmationByUserId
} from "@/data/two-factor-confirmation";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  //  check that user exist and the one that exists in db has an email and password 
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" }
  }

  // if user has not verified email (emailverified columm = datetime field) then get them a token, send by email, and break off login 
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    // break function and prevent them from logging in 
    return { success: "Confirmation email sent!" };
  }

    // if user opts for 2 factor authentication send it here 
  if (existingUser.isTwoFactorEnabled && existingUser.email) {

    // if code passed by user after login
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(
        existingUser.email
      );
      
      // if not register token in the db for the user 
      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      // if the token provided by user dont match what is in db for user

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      // if token has expired 
      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      // if passed remove token from db 
      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id }
      });

      // chect 2fa token create table for confirmation 
      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      // if exists
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id }
        });
      }

      // create fresh entry for user
      // twoFactorConfirmation table holds that a new user has just provided a new valid token
      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        }
      });

      // if code not yet gotten after login get token and send to user email
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)
      await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token,
      );

      // let form know token has been sent 
      return { twoFactor: true };
    }
  }


    // if  2fa token check complete or user didnt opt for 2fa sign them in with provided credentials

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    if (error instanceof AuthError) {

      // find time of error and return message to user
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" }
        default:
          return { error: "Something went wrong!" }
      }
    }

    // this is needed to redirect users to the specified after login url DEFAULT_LOGIN_REDIRECT
    throw error;
  }
};
