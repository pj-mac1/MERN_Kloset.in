const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    registrationMethod: {
      type: String,
      enum: ["gmail", "email", "phone"],
      default: "gmail",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    handle: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    bio: {
      type: String,
      default: "Thrift lover & sustainable fashion explorer 🌿",
    },
    location: {
      type: String,
      default: "Thrift Community",
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password & ensure handle before saving
userSchema.pre("save", async function () {
  if (!this.handle && this.name) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const rand = Math.floor(100 + Math.random() * 900);
    this.handle = `${base || "thrift"}_${rand}`;
  }
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
