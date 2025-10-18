import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'dueño' | 'staff';
  telefono?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: 6,
    },
    rol: {
      type: String,
      enum: ['admin', 'dueño', 'staff'],
      default: 'staff',
    },
    telefono: {
      type: String,
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Evitar errores de modelo duplicado en desarrollo
const Usuario: Model<IUsuario> = 
  mongoose.models.Usuario || mongoose.model<IUsuario>('Usuario', UsuarioSchema);

export default Usuario;

