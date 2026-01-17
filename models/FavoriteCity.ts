import mongoose, { Schema, models, model } from "mongoose";

const FavoriteCitySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    city: { type: String, required: true },
    cityDisplay: { type: String, required: true },
  },
  { timestamps: true }
);

FavoriteCitySchema.index({ userId: 1, city: 1 }, { unique: true });

export const FavoriteCity =
  models.FavoriteCity || model("FavoriteCity", FavoriteCitySchema);
