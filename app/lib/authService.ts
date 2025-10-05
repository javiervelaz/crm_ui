// lib/auth.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
  role?: { id_rol: number }[];
  cliente_id?: BigInt;
  [key: string]: any;
}

export function getDecodedToken(): DecodedToken | null {
  if (typeof window === 'undefined') return null; // Evitar problemas en SSR

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function getClienteId(): BigInt | null {
  const decoded = getDecodedToken();
  return decoded?.cliente_id ?? null;
}

export function isTokenExpired(): boolean {
  const decoded = getDecodedToken();
  if (!decoded?.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}
