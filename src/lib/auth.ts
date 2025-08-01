import { GraphQLError } from "graphql";

export function userIsAuthentic({ user }: any): boolean {
  return user && !user.isExpired;
}

export function checkAuthentication({ user }: any): void {
  // const message = !user ? 'You must be logged in' : 'user login expired';
  const message = "UNAUTHORISED";

  if (!user.email || user.isExpired) {
    throw new GraphQLError(message);
  }
}

export function checkWriterRole({ user }: any) {
  if (!user?.roles?.includes?.("admin")) {
    throw new GraphQLError("REQUIRED_ROLE_MISSING");
  }
  console.log("🙎‍ user roles found", user.roles);
}

export function userIsAdmin({ user }: any) {
  // admin is used as 'internal' role
  return user?.roles?.includes?.("admin") ?? false;
}
