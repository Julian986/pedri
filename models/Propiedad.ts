import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPropiedad extends Document {
  nombre: string;
  descripcion?: string;
  direccion: string;
  ciudad?: string;
  pais?: string;
  tipo: 'apartamento' | 'casa' | 'habitacion' | 'estudio';
  capacidad?: number;
  habitaciones?: number;
  banos?: number;
  precioPorNoche?: number;
  imagenes: string[];
  servicios: string[];
  activo: boolean;
  colorUI?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropiedadSchema = new Schema<IPropiedad>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    descripcion: {
      type: String,
      required: false,
      default: '',
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es requerida'],
    },
    ciudad: {
      type: String,
      required: false,
      default: '',
    },
    pais: {
      type: String,
      required: false,
      default: 'Argentina',
    },
    tipo: {
      type: String,
      enum: ['apartamento', 'casa', 'habitacion', 'estudio'],
      required: false,
      default: 'apartamento',
    },
    capacidad: {
      type: Number,
      required: false,
      min: 1,
      default: 1,
    },
    habitaciones: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    banos: {
      type: Number,
      required: false,
      min: 1,
      default: 1,
    },
    precioPorNoche: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    imagenes: [{
      type: String,
    }],
    servicios: [{
      type: String,
    }],
    activo: {
      type: Boolean,
      default: true,
    },
    colorUI: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'propiedades',
  }
);

const Propiedad: Model<IPropiedad> =
  mongoose.models.Propiedad || mongoose.model<IPropiedad>('Propiedad', PropiedadSchema, 'propiedades');

export default Propiedad;

