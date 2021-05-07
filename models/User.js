const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name can't be empty"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "email can't be empty"],
    },
    role: {
      type: String,
      required: [true, "role can't be empty"],
      enum: ["user", "admin", "superuser"],
    },
  },
  { timestamps: true }
);

const User = model("User", UserSchema);

module.exports = User;
