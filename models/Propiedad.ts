import mongoose, { Schema, Document, Model } from 'mongoose';

export type CanalIcalKey = 'airbnb' | 'booking';

export interface ICanalIcal {
  icalImportUrl?: string;
  icalExportToken?: string;
  ultimoSyncAt?: Date;
  ultimoSyncError?: string | null;
}

export interface IPropiedadCanales {
  /** Token compartido para el feed de exportación de Pedri (una URL por propiedad). */
  icalExportToken?: string;
  airbnb?: ICanalIcal;
  booking?: ICanalIcal;
}

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
  comisionPorcentaje?: number;
  // Precio base por noche (ARS). Se usa para cotizaciones.
  base?: number;
  imagenes: string[];
  servicios: string[];
  activo: boolean;
  colorUI?: string;
  canales?: IPropiedadCanales;
  createdAt: Date;
  updatedAt: Date;
}

const CanalIcalSchema = new Schema(
  {
    icalImportUrl: { type: String, required: false, trim: true, default: '' },
    icalExportToken: { type: String, required: false, trim: true },
    ultimoSyncAt: { type: Date, required: false },
    ultimoSyncError: { type: String, required: false, default: null },
  },
  { _id: false }
);

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
    comisionPorcentaje: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
      default: 12,
    },
    base: {
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
    canales: {
      type: {
        icalExportToken: { type: String, required: false, trim: true },
        airbnb: { type: CanalIcalSchema, required: false },
        booking: { type: CanalIcalSchema, required: false },
      },
      required: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
    collection: 'propiedades',
  }
);

// En desarrollo, Next.js puede mantener el modelo en caché entre recargas (HMR).
// Si el modelo ya fue compilado con un schema viejo, Mongoose ignorará campos nuevos (como `base`).
// Forzamos recompilar el modelo en dev para evitar que se descarten campos.
const MODEL_NAME = 'Propiedad';
if (process.env.NODE_ENV === 'development' && mongoose.models[MODEL_NAME]) {
  delete mongoose.models[MODEL_NAME];
}

const Propiedad: Model<IPropiedad> =
  (mongoose.models[MODEL_NAME] as Model<IPropiedad>) ||
  mongoose.model<IPropiedad>(MODEL_NAME, PropiedadSchema, 'propiedades');

export default Propiedad;
