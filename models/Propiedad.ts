import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPropiedad extends Document {
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  pais: string;
  duenoId: mongoose.Types.ObjectId;
  tipo: 'apartamento' | 'casa' | 'habitacion' | 'estudio';
  capacidad: number;
  habitaciones: number;
  banos: number;
  precioPorNoche: number;
  imagenes: string[];
  servicios: string[];
  activo: boolean;
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
      required: [true, 'La descripción es requerida'],
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es requerida'],
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es requerida'],
    },
    pais: {
      type: String,
      required: [true, 'El país es requerido'],
      default: 'Argentina',
    },
    duenoId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El dueño es requerido'],
    },
    tipo: {
      type: String,
      enum: ['apartamento', 'casa', 'habitacion', 'estudio'],
      required: [true, 'El tipo es requerido'],
    },
    capacidad: {
      type: Number,
      required: [true, 'La capacidad es requerida'],
      min: 1,
    },
    habitaciones: {
      type: Number,
      required: [true, 'El número de habitaciones es requerido'],
      min: 0,
    },
    banos: {
      type: Number,
      required: [true, 'El número de baños es requerido'],
      min: 1,
    },
    precioPorNoche: {
      type: Number,
      required: [true, 'El precio por noche es requerido'],
      min: 0,
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
  },
  {
    timestamps: true,
  }
);

const Propiedad: Model<IPropiedad> = 
  mongoose.models.Propiedad || mongoose.model<IPropiedad>('Propiedad', PropiedadSchema);

export default Propiedad;

