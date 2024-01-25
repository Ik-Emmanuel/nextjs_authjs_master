import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {

  // get current url 
  const { nextUrl } = req;

  // check is user logged in 
  const isLoggedIn = !!req.auth;

  // check if it starts with a route type 
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  // check if the routes is one of the specified routes 
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);


// The ordering of these if clauses is IMPORTANT 
//   check if in defined api auth route and allow
  if (isApiAuthRoute) {
    return null;
  }

// check if user is in an auth required route and checked if they are logged in 
  if (isAuthRoute) {
    // if they are logged in prevent user seeing login screen again 
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))  // add nextUrl so absolute path is obtained
    }
    return null;
  }

  // after user logs out or needs authentication prepare the next page
  if (!isLoggedIn && !isPublicRoute) {

    // if they go to a route unauthenticated catch the route and use after sign in
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    // if user is not logged and and is not on a public route send em to sign in 
    return Response.redirect(new URL(
      `/auth/login?callbackUrl=${encodedCallbackUrl}`,
      nextUrl
    ));
  }

  // else allow every other
  return null;
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    //whenever these paths are fulfilled, invoke the auth function above
    // These catches all routes except a few system internal routes 
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}