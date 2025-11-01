import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  userId: number;
  balance: number;
  subscribed: boolean;
  subscriptionType: 'monthly' | 'lifetime' | null;
  subscriptionEnd: Date | null;
}

const userSchema = new mongoose.Schema<IUser>({
  userId: { type: Number, required: true, unique: true },
  balance: { type: Number, default: 0 },
  subscribed: { type: Boolean, default: false },
  subscriptionType: { type: String, enum: ['monthly', 'lifetime'], default: null },
  subscriptionEnd: { type: Date, default: null },
});

const User = mongoose.model<IUser>('User', userSchema);

export { User };
