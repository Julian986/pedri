import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export interface AuthUser {
  userId: string;
  email: string;
  rol: string;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return null;
  }

  return decoded as AuthUser;
}

export function requireAuth(request: NextRequest): NextResponse | AuthUser {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado. Por favor inicia sesión.' },
      { status: 401 }
    );
  }

  return user;
}

export function requireAdmin(request: NextRequest): NextResponse | AuthUser {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado. Por favor inicia sesión.' },
      { status: 401 }
    );
  }

  if (user.rol !== 'admin') {
    return NextResponse.json(
      { error: 'Acceso denegado. Se requieren permisos de administrador.' },
      { status: 403 }
    );
  }

  return user;
}

