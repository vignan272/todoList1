const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Todo name is required"],
      trim: true,
      minlength: 1,
      maxlength: 200,
    },

    isDone: {
      type: Boolean,
      default: false, // ✅ safer than required:true
    },

    // ✅ TIMESTAMP (milliseconds)
    expiryAt: {
      type: Number,
      default: null, // allows todos without alarm
      validate: {
        validator: function (v) {
          return v === null || typeof v === "number";
        },
        message: "expiryAt must be a timestamp (number) or null",
      },
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    alarmEnabled: {
      type: Boolean,
      default: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true, // ✅ faster queries
    },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  }
);

// ✅ Optional index for sorting by expiry
TodoSchema.index({ userId: 1, expiryAt: 1 });

const TodoModel = mongoose.model("todolist", TodoSchema);
module.exports = TodoModel;
