import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Propiedad from '@/models/Propiedad';


// GET - Obtener una propiedad por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const propiedad = await Propiedad.findById(params.id);

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ propiedad });
  } catch (error) {
    console.error('Error obteniendo propiedad:', error);
    return NextResponse.json(
      { error: 'Error obteniendo propiedad' },
      { status: 500 }
    );
  }
}

function ensureExportTokensInUpdate(data: Record<string, unknown>) {
  const canales = data.canales as
    | {
        icalExportToken?: string;
        airbnb?: { icalImportUrl?: string; icalExportToken?: string };
        booking?: { icalImportUrl?: string; icalExportToken?: string };
      }
    | undefined;

  if (!canales) return data;

  const token =
    canales.icalExportToken ||
    canales.airbnb?.icalExportToken ||
    canales.booking?.icalExportToken ||
    crypto.randomBytes(24).toString('hex');

  data.canales = {
    ...canales,
    icalExportToken: token,
    airbnb: {
      ...(canales.airbnb || {}),
      icalExportToken: token,
    },
    booking: {
      ...(canales.booking || {}),
      icalExportToken: token,
    },
  };
  return data;
}

// PUT - Actualizar propiedad
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const data = await request.json();
    console.log(`[PUT /api/propiedades/${params.id}] Datos recibidos:`, JSON.stringify(data, null, 2));

    // Si actualizan canales, preservar token existente si el cliente no lo manda
    if (data.canales) {
      const actual = await Propiedad.findById(params.id).select('canales').lean();
      const existingToken =
        actual?.canales?.icalExportToken ||
        actual?.canales?.airbnb?.icalExportToken ||
        actual?.canales?.booking?.icalExportToken;

      if (existingToken && !data.canales.icalExportToken) {
        data.canales.icalExportToken = existingToken;
      }
      // Preservar sync metadata si el cliente no la envía
      if (actual?.canales?.airbnb && data.canales.airbnb) {
        if (data.canales.airbnb.ultimoSyncAt === undefined) {
          data.canales.airbnb.ultimoSyncAt = actual.canales.airbnb.ultimoSyncAt;
        }
        if (data.canales.airbnb.ultimoSyncError === undefined) {
          data.canales.airbnb.ultimoSyncError = actual.canales.airbnb.ultimoSyncError;
        }
      }
      if (actual?.canales?.booking && data.canales.booking) {
        if (data.canales.booking.ultimoSyncAt === undefined) {
          data.canales.booking.ultimoSyncAt = actual.canales.booking.ultimoSyncAt;
        }
        if (data.canales.booking.ultimoSyncError === undefined) {
          data.canales.booking.ultimoSyncError = actual.canales.booking.ultimoSyncError;
        }
      }
      ensureExportTokensInUpdate(data);
    }

    const propiedad = await Propiedad.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    console.log(`[PUT /api/propiedades/${params.id}] Propiedad actualizada:`, JSON.stringify(propiedad.toObject(), null, 2));

    return NextResponse.json({ propiedad });
  } catch (error) {
    console.error('Error actualizando propiedad:', error);
    return NextResponse.json(
      { error: 'Error actualizando propiedad' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar propiedad (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const propiedad = await Propiedad.findByIdAndUpdate(
      params.id,
      { activo: false },
      { new: true }
    );

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Propiedad desactivada correctamente' });
  } catch (error) {
    console.error('Error eliminando propiedad:', error);
    return NextResponse.json(
      { error: 'Error eliminando propiedad' },
      { status: 500 }
    );
  }
}
