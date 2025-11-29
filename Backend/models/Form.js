const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema(
  {
    questionKey: { type: String, required: true },
    operator: {
      type: String,
      enum: ["equals", "notEquals", "contains"],
      required: true,
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const conditionalRulesSchema = new mongoose.Schema(
  {
    logic: { type: String, enum: ["AND", "OR"], default: "AND" },
    conditions: [conditionSchema],
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionKey: { type: String, required: true },
    airtableFieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["shortText", "longText", "singleSelect", "multiSelect", "attachment"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: [
      {
        id: String,
        name: String,
      },
    ],
    conditionalRules: {
      type: conditionalRulesSchema,
      default: null,
    },
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },

    airtableBaseId: { type: String, required: true },
    airtableTableId: { type: String, required: true },

    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
