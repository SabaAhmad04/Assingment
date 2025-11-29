const express = require("express");
const requireAuth = require("../middlewares/auth");
const Form = require("../models/Form");
const Response = require("../models/Response");
const { shouldShowQuestion } = require("../utils/conditional");

const router = express.Router();

router.post("/:formId/responses", requireAuth, async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    const errors = [];
    const airtableRecord = {};

    for (const q of form.questions) {
      const isVisible = shouldShowQuestion(q.conditionalRules, answers);

      if (!isVisible) continue;

      const val = answers[q.questionKey];

      if (q.required && (val === undefined || val === null || val === "")) {
        errors.push(`Missing required field: ${q.label}`);
      }

      if (q.type === "singleSelect" && val) {
        const valid = q.options.map((o) => o.name);
        if (!valid.includes(val)) {
          errors.push(`Invalid option for ${q.label}`);
        }
      }

      airtableRecord[q.airtableFieldId] = val;
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const newResponse = new Response({
      formId,
      airtableRecordId: null,
      answers,
    });

    await newResponse.save();

    return res.status(201).json({
      message: "Response saved (Mongo only, Airtable skipped in dev)",
      response: newResponse,
    });
  } catch (err) {
    console.error("Submit error:", err.message);
    return res.status(500).json({ message: "Failed to submit response" });
  }
});

module.exports = router;
