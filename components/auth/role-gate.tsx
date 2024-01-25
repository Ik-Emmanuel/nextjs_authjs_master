"use client";

import { UserRole } from "@prisma/client";
import { useCurrentRole } from "@/hooks/use-current-role";
import { FormError } from "@/components/form-error";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

/// ROLE BASE ACCESS setter to components  wrap this around component and it checks if user is allowed
export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const role = useCurrentRole();

  if (role !== allowedRole) {
    // if user is not of the role type that is allowed, prevent the children component from showing
    return (
      <FormError message="You do not have permission to view this content!" />
    );
  }
  // else if they are, allow the said compoments to show
  return <>{children}</>;
};
