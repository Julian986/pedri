import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPago extends Document {
  reservaId: mongoose.Types.ObjectId;
  propiedadId: mongoose.Types.ObjectId;
  monto: number;
  moneda: 'ARS' | 'USD';
  comisionPorcentaje: number;
  comisionMonto: number;
  montoDueno: number;
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta' | 'plataforma';
  estado: 'pendiente' | 'pagado' | 'cancelado';
  fechaPago?: Date;
  comprobante?: string;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PagoSchema = new Schema<IPago>(
  {
    reservaId: {
      type: Schema.Types.ObjectId,
      ref: 'Reserva',
      required: [true, 'La reserva es requerida'],
    },
    propiedadId: {
      type: Schema.Types.ObjectId,
      ref: 'Propiedad',
      required: [true, 'La propiedad es requerida'],
    },
    monto: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: 0,
    },
    moneda: {
      type: String,
      enum: ['ARS', 'USD'],
      required: [true, 'La moneda es requerida'],
    },
    comisionPorcentaje: {
      type: Number,
      required: [true, 'El porcentaje de comisión es requerido'],
      min: 0,
      max: 100,
      default: 10,
    },
    comisionMonto: {
      type: Number,
      required: [true, 'El monto de comisión es requerido'],
      min: 0,
    },
    montoDueno: {
      type: Number,
      required: [true, 'El monto para el dueño es requerido'],
      min: 0,
    },
    metodoPago: {
      type: String,
      enum: ['efectivo', 'transferencia', 'tarjeta', 'plataforma'],
      required: [true, 'El método de pago es requerido'],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'pagado', 'cancelado'],
      default: 'pendiente',
    },
    fechaPago: {
      type: Date,
    },
    comprobante: {
      type: String,
    },
    notas: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para listados y agregaciones por reserva/propiedad y fecha
PagoSchema.index({ reservaId: 1, fechaPago: -1 });
PagoSchema.index({ propiedadId: 1, fechaPago: -1 });

const Pago: Model<IPago> = 
  mongoose.models.Pago || mongoose.model<IPago>('Pago', PagoSchema);

export default Pago;

