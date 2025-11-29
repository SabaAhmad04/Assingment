const express = require("express");
const requireAuth = require("../middlewares/auth");
const Form = require("../models/Form");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, airtableBaseId, airtableTableId, questions } = req.body;

    if (!title || !airtableBaseId || !airtableTableId || !questions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions must be a non-empty array" });
    }

    for (const q of questions) {
      if (!q.questionKey || !q.airtableFieldId || !q.label || !q.type) {
        return res.status(400).json({
          message: "Each question must have questionKey, airtableFieldId, label, type",
        });
      }
    }

    const form = new Form({
      owner: req.user._id,
      title,
      airtableBaseId,
      airtableTableId,
      questions,
    });

    await form.save();

    return res.status(201).json({
      message: "Form created",
      formId: form._id,
      form,
    });
  } catch (err) {
    console.error("Error creating form:", err.message);
    return res.status(500).json({ message: "Failed to create form" });
  }
});

router.get("/:formId", requireAuth, async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (!form.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    return res.json(form);
  } catch (err) {
    console.error("Error fetching form:", err.message);
    return res.status(500).json({ message: "Failed to fetch form" });
  }
});

module.exports = router;
