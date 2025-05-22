const mongoose = require("mongoose");
const mapboxCounterSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  count: { type: Number, default: 0 },
});

// Ensure one document per year+month
mapboxCounterSchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MapboxCounter", mapboxCounterSchema);
