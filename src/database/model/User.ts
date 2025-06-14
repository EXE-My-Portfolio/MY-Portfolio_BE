import mongoose from "mongoose";

export type Role = "user" | "admin" | "blocker";
export type State = "pending" | "active";

export interface PriceNotification {
  ticker: string;
  price: number;
  trend: "up" | "down";
}

export type Gender = "male" | "female" | "other" | "unknown";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
    },
    state: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

export interface UserAttrs {
  fullName: string;
  email: string;
  role: Role;
  password: string;
  state: State;
  cic: string;
  gender: Gender;
  dob: Date;
  campus: string;
  isGetMailNotify?: boolean;
  priceNotifications?: PriceNotification[]; // Use the PriceNotification interface
}

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

export interface userDoc extends mongoose.Document {
  fullName: string;
  email: string;
  role: Role;
  password: string;
  state: State;
  gender: Gender;
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends mongoose.Model<userDoc> {
  build(
    attrs: Pick<UserAttrs, "fullName" | "email" | "password" | "dob" | "gender">
  ): userDoc;
}

const User = mongoose.model<userDoc, UserModel>("User", userSchema);
export { User };
