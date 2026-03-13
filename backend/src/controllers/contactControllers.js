import Contact from "../models/Contact.js";
import { sendReplyEmail } from "../config/email.js";

// POST /api/contacts — public, anyone can submit
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, subject, and message.",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been received. We'll get back to you soon!",
      data: contact,
    });
  } catch (error) {
    console.error("createContact error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/contacts — admin only
export const getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isRead === "true") filter.isRead = true;
    if (req.query.isRead === "false") filter.isRead = false;

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getAllContacts error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/contacts/:id/read — admin only
export const markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found." });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// DELETE /api/contacts/:id — admin only
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found." });
    }
    res.json({ success: true, message: "Contact deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/contacts/unread-count — admin only
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments({ isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/contacts/:id/reply — admin only
export const replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage || !replyMessage.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Reply message is required." });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found." });
    }

    const result = await sendReplyEmail({
      toEmail: contact.email,
      toName: contact.name,
      subject: contact.subject,
      replyMessage: replyMessage.trim(),
      adminName: req.user?.username || "Support Team",
    });

    if (!result.success) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to send email: " + result.error,
        });
    }

    // Mark as read
    await Contact.findByIdAndUpdate(req.params.id, { isRead: true });

    res.json({ success: true, message: `Reply sent to ${contact.email}` });
  } catch (error) {
    console.error("replyToContact error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
