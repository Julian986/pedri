import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { nombre, email, password, telefono } = await request.json();

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const existingUser = await Usuario.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const usuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      rol: 'staff', // Por defecto, se crea como staff
    });

    const token = generateToken(
      String(usuario._id), 
      usuario.email as string, 
      usuario.rol as string
    );

    return NextResponse.json(
      {
        token,
        usuario: {
          id: String(usuario._id),
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

