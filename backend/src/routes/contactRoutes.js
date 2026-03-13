import express from "express";
import {
  createContact,
  getAllContacts,
  markAsRead,
  deleteContact,
  getUnreadCount,
  replyToContact,
} from "../controllers/contactControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public — submit a contact form
router.post("/", createContact);

// Admin only
router.get("/", authenticateToken, requireAdmin, getAllContacts);
router.get("/unread-count", authenticateToken, requireAdmin, getUnreadCount);
router.patch("/:id/read", authenticateToken, requireAdmin, markAsRead);
router.post("/:id/reply", authenticateToken, requireAdmin, replyToContact);
router.delete("/:id", authenticateToken, requireAdmin, deleteContact);

export default router;
