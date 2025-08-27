// server/models/Connection.js

const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Before saving, ALWAYS sort the users array. This is crucial for the unique index to work.
connectionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.users.sort();
  }
  next();
});

// Create a unique index on the combination of users.
// This prevents [userA, userB] and [userB, userA] from both existing.
connectionSchema.index({ users: 1 }, { unique: true });

module.exports = mongoose.model("Connection", connectionSchema);