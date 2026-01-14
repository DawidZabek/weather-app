import { Schema, model, models } from "mongoose";

const FavoriteSchema = new Schema(
  {
    city: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Favorite = models.Favorite || model("Favorite", FavoriteSchema);
