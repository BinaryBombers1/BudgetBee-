import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: {
      type: String,
      enum: ["bug", "idea", "praise", "other"],
      default: "other",
    },
    rating: { type: Number, min: 1, max: 5 },
    message: { type: String, required: true, minlength: 5, maxlength: 2000 },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new", index: true },
    adminReply: { type: String, maxlength: 1000, default: "" },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
