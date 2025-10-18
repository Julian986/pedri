import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReserva extends Document {
  propiedadId: mongoose.Types.ObjectId;
  nombreHuesped: string;
  emailHuesped: string;
  telefonoHuesped: string;
  fechaInicio: Date;
  fechaFin: Date;
  numeroHuespedes: number;
  precioTotal: number;
  origen: 'Airbnb' | 'Booking' | 'Particular' | 'Otro';
  estado: 'pendiente' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada';
  notas?: string;
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
      required: [true, 'El email del huésped es requerido'],
      lowercase: true,
      trim: true,
    },
    telefonoHuesped: {
      type: String,
      required: [true, 'El teléfono del huésped es requerido'],
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
    },
    precioTotal: {
      type: Number,
      required: [true, 'El precio total es requerido'],
      min: 0,
    },
    origen: {
      type: String,
      enum: ['Airbnb', 'Booking', 'Particular', 'Otro'],
      required: [true, 'El origen es requerido'],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada'],
      default: 'pendiente',
    },
    notas: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para búsquedas rápidas de disponibilidad
ReservaSchema.index({ propiedadId: 1, fechaInicio: 1, fechaFin: 1 });

const Reserva: Model<IReserva> = 
  mongoose.models.Reserva || mongoose.model<IReserva>('Reserva', ReservaSchema);

export default Reserva;

