import { currentRole } from "@/lib/auth"; //server way to fetch role
import { UserRole } from "@prisma/client"; // Enum
import { NextResponse } from "next/server";  // return API json response

export async function GET() {

  // check what role the user is off
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: 200 });
  }

  // reject api request if user trying to call is off unauthorised role
  return new NextResponse(null, { status: 403 });
}