import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGasto extends Document {
  propiedadId: mongoose.Types.ObjectId;
  categoria: 'limpieza' | 'mantenimiento' | 'servicios' | 'impuestos' | 'otros';
  fecha: Date;
  monto: number;
  moneda: 'ARS' | 'USD';
  nota?: string;
  descripcion?: string;
  proveedor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GastoSchema = new Schema<IGasto>(
  {
    propiedadId: {
      type: Schema.Types.ObjectId,
      ref: 'Propiedad',
      required: [true, 'La propiedad es requerida'],
    },
    categoria: {
      type: String,
      enum: ['limpieza', 'mantenimiento', 'servicios', 'impuestos', 'otros'],
      required: [true, 'La categoría es requerida'],
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es requerida'],
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
    nota: {
      type: String,
    },
    descripcion: {
      type: String,
    },
    proveedor: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para listados y análisis por propiedad y fecha
GastoSchema.index({ propiedadId: 1, fecha: -1 });

const Gasto: Model<IGasto> =
  mongoose.models.Gasto || mongoose.model<IGasto>('Gasto', GastoSchema);

export default Gasto;


