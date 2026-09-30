import { Feedback } from "../models/Feedback.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const createFeedback = asyncHandler(async (req, res) => {
  const { category, rating, message } = req.body;
  const feedback = await Feedback.create({
    userId: req.user.id,
    category,
    rating,
    message,
  });
  return sendSuccess(res, { feedback }, "Thanks! Your feedback was sent to the team.", 201);
});

export const listMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return sendSuccess(res, { feedback });
});

export const listAllFeedback = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status && ["new", "read", "resolved"].includes(status)) filter.status = status;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit) || 20);

  const [items, total, counts] = await Promise.all([
    Feedback.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Feedback.countDocuments(filter),
    Feedback.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const statusCounts = { new: 0, read: 0, resolved: 0 };
  counts.forEach((c) => {
    if (statusCounts[c._id] !== undefined) statusCounts[c._id] = c.count;
  });

  return sendSuccess(res, {
    feedback: items,
    counts: statusCounts,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const replyFeedback = asyncHandler(async (req, res) => {
  const { reply, status } = req.body;
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw ApiError.notFound("Feedback not found");

  if (typeof reply === "string") {
    feedback.adminReply = reply.trim();
    feedback.repliedAt = new Date();
    if (feedback.status === "new") feedback.status = "read";
  }
  if (status && ["new", "read", "resolved"].includes(status)) feedback.status = status;

  await feedback.save();
  return sendSuccess(res, { feedback }, "Feedback updated");
});

export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) throw ApiError.notFound("Feedback not found");
  return sendSuccess(res, null, "Feedback deleted");
});
