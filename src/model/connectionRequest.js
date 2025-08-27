const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is INVALID`,
      },
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  if (
    connectionRequest.toUserId.toString() ===
    connectionRequest.fromUserId.toString()
  ) {
    throw new Error("Cannot send connection request to yourself");
  }

  next();
});

const connectionRequest = new mongoose.model(
  "connectionRequest",
  connectionRequestSchema
);

module.exports = connectionRequest;
