const express = require("express");
const axios = require("axios");
const requireAuth = require("../middlewares/auth");

const router = express.Router();

router.get("/bases", requireAuth, async (req, res) => {

  return res.json({
    bases: [
      {
        id: "appEtFfO62tJl3ZHf",
        name: "Assignment",
        permissionLevel: "create",
      },
    ],
  });
});


router.get("/bases/:baseId/tables", requireAuth, async (req, res) => {
  const { baseId } = req.params;

  if (baseId !== "appEtFfO62tJl3ZHf") {
    return res.json({ tables: [] });
  }

  return res.json({
    tables: [
      {
        id: "tblC7IQYyGQ2Wo3Xh",
        name: "Table 1",
        primaryFieldId: "fldkApxDOli4gwRSx",
      },
    ],
  });
});


router.get(
  "/bases/:baseId/tables/:tableId/fields",
  requireAuth,
  async (req, res) => {
    const { baseId, tableId } = req.params;

    if (baseId !== "appEtFfO62tJl3ZHf" || tableId !== "tblC7IQYyGQ2Wo3Xh") {
      return res.status(404).json({ message: "Table not found" });
    }

    const fields = [
      {
        airtableFieldId: "fldkApxDOli4gwRSx",
        name: "Name",
        airtableType: "singleLineText",
        type: "shortText",
      },
      {
        airtableFieldId: "fldrD1NnYIDn9Httj",
        name: "Notes",
        airtableType: "multilineText",
        type: "longText",
      },
      {
        airtableFieldId: "fldkPvxNGoT983gyF",
        name: "Status",
        airtableType: "singleSelect",
        type: "singleSelect",
        options: [
          { id: "selUykxbzwVzBMVKY", name: "Todo" },
          { id: "seleCTEDzVGbBuBbg", name: "In progress" },
          { id: "selYnVbTcZU6KeiGw", name: "Done" },
        ],
      },
      {
        airtableFieldId: "fldsdZ3i4LhoNHXo4",
        name: "Attachments",
        airtableType: "multipleAttachments",
        type: "attachment",
      },
    ];

    return res.json({
      baseId,
      tableId,
      tableName: "Table 1",
      fields,
    });
  }
);


module.exports = router;
