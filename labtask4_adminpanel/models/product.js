const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: {
      type: String,
      default: "https://via.placeholder.com/300x300?text=Product",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

// frontend ke liye id map
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);
