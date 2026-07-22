import mongoose, { Model, Schema } from 'mongoose';

export interface IReservaHold {
  propiedadId: mongoose.Types.ObjectId;
  reservaId: mongoose.Types.ObjectId;
  fecha: string;
  expiresAt: Date;
}

const ReservaHoldSchema = new Schema<IReservaHold>(
  {
    propiedadId: { type: Schema.Types.ObjectId, ref: 'Propiedad', required: true },
    reservaId: { type: Schema.Types.ObjectId, ref: 'Reserva', required: true },
    fecha: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

ReservaHoldSchema.index({ propiedadId: 1, fecha: 1 }, { unique: true });
ReservaHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
ReservaHoldSchema.index({ reservaId: 1 });

const ReservaHold: Model<IReservaHold> =
  (mongoose.models.ReservaHold as Model<IReservaHold>) ||
  mongoose.model<IReservaHold>('ReservaHold', ReservaHoldSchema);

export default ReservaHold;
