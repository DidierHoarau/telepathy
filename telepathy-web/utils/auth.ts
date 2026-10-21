import { jwtDecode } from "jwt-decode";

export interface TelepathyTokenClaims {
  user_id?: string;
  user_name?: string;
  exp?: number;
}

export function decodeToken(token: string | null): TelepathyTokenClaims | null {
  if (!token) return null;
  try {
    return jwtDecode<TelepathyTokenClaims>(token);
  } catch {
    return null;
  }
}

export function userNameFromToken(token: string | null): string {
  const claims = decodeToken(token);
  return typeof claims?.user_name === "string" ? claims.user_name : "";
}

export function userIdFromToken(token: string | null): string {
  const claims = decodeToken(token);
  return typeof claims?.user_id === "string" ? claims.user_id : "";
}

export function tokenExpiry(token: string | null): Date | null {
  const claims = decodeToken(token);
  return typeof claims?.exp === "number" ? new Date(claims.exp * 1000) : null;
}
