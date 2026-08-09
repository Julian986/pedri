import mongoose, { Schema, Document, Model } from 'mongoose';

export type ExternalSource = 'airbnb' | 'booking' | 'pedri';

export interface IReserva extends Document {
  propiedadId: mongoose.Types.ObjectId;
  nombreHuesped: string;
  emailHuesped?: string;
  telefonoHuesped?: string;
  fechaInicio: Date;
  fechaFin: Date;
  numeroHuespedes: number;
  precioTotal: number;
  /** Seña / anticipo cobrado (ARS). */
  sena?: number;
  origen: 'Airbnb' | 'Booking' | 'Facebook' | 'Mercado Libre' | 'Recomendado' | 'Particular' | 'Otro' | 'Web';
  estado: 'pendiente' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'bloqueo';
  notas?: string;
  /** UID del evento iCal (idempotencia de import). */
  externalUid?: string;
  /** Canal de origen del evento externo. */
  externalSource?: ExternalSource;
  pagoEstado?: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado' | 'reembolsado';
  mercadoPagoPreferenceId?: string;
  mercadoPagoPaymentId?: string;
  pagoExpiraEn?: Date;
  pagoAprobadoEn?: Date;
  moneda?: 'ARS';
  createdAt: Date;
  updatedAt: Date;
}

const ReservaSchema = new Schema<IReserva>(
  {
    propiedadId: {
      type: Schema.Types.ObjectId,
      ref: 'Propiedad',
      required: [true, 'La propiedad es requerida'],
    },
    nombreHuesped: {
      type: String,
      required: [true, 'El nombre del huésped es requerido'],
      trim: true,
    },
    emailHuesped: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },
    telefonoHuesped: {
      type: String,
      required: false,
      trim: true,
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es requerida'],
    },
    fechaFin: {
      type: Date,
      required: [true, 'La fecha de fin es requerida'],
    },
    numeroHuespedes: {
      type: Number,
      required: [true, 'El número de huéspedes es requerido'],
      min: 1,
      default: 1,
    },
    precioTotal: {
      type: Number,
      required: [true, 'El precio total es requerido'],
      min: 0,
    },
    sena: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    origen: {
      type: String,
      enum: ['Airbnb', 'Booking', 'Facebook', 'Mercado Libre', 'Recomendado', 'Particular', 'Otro', 'Web'],
      required: [true, 'El origen es requerido'],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada', 'bloqueo'],
      default: 'pendiente',
    },
    notas: {
      type: String,
    },
    externalUid: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    externalSource: {
      type: String,
      enum: ['airbnb', 'booking', 'pedri'],
      required: false,
    },
    pagoEstado: {
      type: String,
      enum: ['pendiente', 'aprobado', 'rechazado', 'cancelado', 'reembolsado'],
      required: false,
    },
    mercadoPagoPreferenceId: {
      type: String,
      required: false,
      index: true,
    },
    mercadoPagoPaymentId: {
      type: String,
      required: false,
      index: true,
    },
    pagoExpiraEn: {
      type: Date,
      required: false,
    },
    pagoAprobadoEn: {
      type: Date,
      required: false,
    },
    moneda: {
      type: String,
      enum: ['ARS'],
      required: false,
      default: 'ARS',
    },
  },
  {
    timestamps: true,
  }
);

// Índice para búsquedas rápidas de disponibilidad
ReservaSchema.index({ propiedadId: 1, fechaInicio: 1, fechaFin: 1 });
// Índices adicionales para filtro por rangos en Calendario/Listados
ReservaSchema.index({ propiedadId: 1, fechaInicio: 1 });
ReservaSchema.index({ propiedadId: 1, fechaFin: 1 });
// Idempotencia iCal: un UID externo por propiedad (solo cuando hay externalUid)
ReservaSchema.index(
  { propiedadId: 1, externalUid: 1 },
  {
    unique: true,
    partialFilterExpression: { externalUid: { $type: 'string', $gt: '' } },
  }
);

/**
 * Consulta estándar de Calendario (mes visible):
 * propiedadId = X
 * AND fechaInicio < finMes
 * AND fechaFin > inicioMes
 * AND estado != 'cancelada'
 * Nota: usar rango [fechaInicio, fechaFin) (fin exclusivo) para evitar solapamientos en checkout/checkin.
 */

// En desarrollo, forzar refresco del modelo si ya estaba registrado con un schema viejo
if (mongoose.models.Reserva) {
  delete mongoose.models.Reserva;
}
const Reserva: Model<IReserva> = mongoose.model<IReserva>('Reserva', ReservaSchema);

export default Reserva;
