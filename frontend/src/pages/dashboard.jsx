import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/context.jsx";
import { useNavigate } from "react-router-dom";


const API_BASE = "http://localhost:5000";

export default function Dashboard() {
  const { token, logout } = useAuth();

  const [bases, setBases] = useState([]);
  const [loadingBases, setLoadingBases] = useState(false);

  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const [selectedTableId, setSelectedTableId] = useState("");
  const [fields, setFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);

  const [formTitle, setFormTitle] = useState("Assignment Demo Form");
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [creatingForm, setCreatingForm] = useState(false);
  const [createdFormId, setCreatedFormId] = useState("");

  if (!token) {
    return <p style={{ padding: "2rem" }}>No token. Go back and log in.</p>;
  }

  useEffect(() => {
    const fetchBases = async () => {
      try {
        setLoadingBases(true);
        const res = await axios.get(`${API_BASE}/airtable/bases`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Bases response:", res.data);
        setBases(res.data.bases || []);
      } catch (err) {
        console.error("Error fetching bases:", err.response?.data || err.message);
      } finally {
        setLoadingBases(false);
      }
    };

    fetchBases();
  }, [token]);

  const handleBaseChange = async (e) => {
    const baseId = e.target.value;
    setSelectedBaseId(baseId);
    setSelectedTableId("");
    setTables([]);
    setFields([]);
    setSelectedQuestions({});
    setCreatedFormId("");

    if (!baseId) return;

    try {
      setLoadingTables(true);
      const res = await axios.get(`${API_BASE}/airtable/bases/${baseId}/tables`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Tables response:", res.data);
      setTables(res.data.tables || []);
    } catch (err) {
      console.error("Error fetching tables:", err.response?.data || err.message);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleTableChange = async (e) => {
    const tableId = e.target.value;
    setSelectedTableId(tableId);
    setFields([]);
    setSelectedQuestions({});
    setCreatedFormId("");

    if (!tableId || !selectedBaseId) return;

    try {
      setLoadingFields(true);
      const res = await axios.get(
        `${API_BASE}/airtable/bases/${selectedBaseId}/tables/${tableId}/fields`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fields response:", res.data);
      setFields(res.data.fields || []);
    } catch (err) {
      console.error("Error fetching fields:", err.response?.data || err.message);
    } finally {
      setLoadingFields(false);
    }
  };

  const toggleFieldSelected = (field) => {
    setSelectedQuestions((prev) => {
      const copy = { ...prev };
      if (copy[field.airtableFieldId]) {
        delete copy[field.airtableFieldId];
      } else {
        copy[field.airtableFieldId] = {
          questionKey: makeQuestionKey(field.name),
          airtableFieldId: field.airtableFieldId,
          label: field.name,
          type: field.type, 
          required: false,
          options: field.options || [],
          conditionalRules: null,
        };
      }
      return copy;
    });
  };

  const updateQuestionLabel = (airtableFieldId, newLabel) => {
    setSelectedQuestions((prev) => ({
      ...prev,
      [airtableFieldId]: {
        ...prev[airtableFieldId],
        label: newLabel,
      },
    }));
  };

  const toggleQuestionRequired = (airtableFieldId) => {
    setSelectedQuestions((prev) => ({
      ...prev,
      [airtableFieldId]: {
        ...prev[airtableFieldId],
        required: !prev[airtableFieldId].required,
      },
    }));
  };

  const handleCreateForm = async () => {
    if (!selectedBaseId || !selectedTableId) {
      alert("Please select a base and a table.");
      return;
    }
    const questionsArray = Object.values(selectedQuestions);
    if (questionsArray.length === 0) {
      alert("Select at least one field for the form.");
      return;
    }

    try {
      setCreatingForm(true);
      const res = await axios.post(
        `${API_BASE}/forms`,
        {
          title: formTitle,
          airtableBaseId: selectedBaseId,
          airtableTableId: selectedTableId,
          questions: questionsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Create form response:", res.data);
      setCreatedFormId(res.data.formId);
      alert("Form created successfully!");
    } catch (err) {
      console.error("Error creating form:", err.response?.data || err.message);
      alert("Failed to create form. Check console.");
    } finally {
      setCreatingForm(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h2>Form Builder Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Form Title:&nbsp;
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            style={{ width: "300px" }}
          />
        </label>
      </div>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3>1. Select Airtable Base</h3>
        {loadingBases ? (
          <p>Loading bases...</p>
        ) : bases.length === 0 ? (
          <p>No bases found.</p>
        ) : (
          <select value={selectedBaseId} onChange={handleBaseChange}>
            <option value="">-- Choose a base --</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.id})
              </option>
            ))}
          </select>
        )}
      </section>

      {selectedBaseId && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3>2. Select Table</h3>
          {loadingTables ? (
            <p>Loading tables...</p>
          ) : tables.length === 0 ? (
            <p>No tables found for this base.</p>
          ) : (
            <select value={selectedTableId} onChange={handleTableChange}>
              <option value="">-- Choose a table --</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.id})
                </option>
              ))}
            </select>
          )}
        </section>
      )}

      {selectedTableId && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3>3. Select Fields for Form</h3>
          {loadingFields ? (
            <p>Loading fields...</p>
          ) : fields.length === 0 ? (
            <p>No supported fields found.</p>
          ) : (
            <div>
              {fields.map((f) => {
                const selected = !!selectedQuestions[f.airtableFieldId];
                return (
                  <div
                    key={f.airtableFieldId}
                    style={{
                      border: "1px solid #ddd",
                      padding: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleFieldSelected(f)}
                      />{" "}
                      <strong>{f.name}</strong>{" "}
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>
                        ({f.type})
                      </span>
                    </label>

                    {selected && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ marginBottom: "0.25rem" }}>
                          Label:&nbsp;
                          <input
                            type="text"
                            value={selectedQuestions[f.airtableFieldId]?.label || ""}
                            onChange={(e) =>
                              updateQuestionLabel(f.airtableFieldId, e.target.value)
                            }
                            style={{ width: "260px" }}
                          />
                        </div>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedQuestions[f.airtableFieldId]?.required || false}
                            onChange={() => toggleQuestionRequired(f.airtableFieldId)}
                          />{" "}
                          Required
                        </label>

                        {f.type === "singleSelect" && (
                          <div style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
                            Options:{" "}
                            {f.options?.map((o) => o.name).join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {selectedTableId && (
        <section>
          <button disabled={creatingForm} onClick={handleCreateForm}>
            {creatingForm ? "Creating form..." : "Create Form"}
          </button>

          {createdFormId && (
            <p style={{ marginTop: "0.75rem" }}>
               Form created! ID: <code>{createdFormId}</code>
              <br />
              (Use this ID later in the viewer: <code>/form/{createdFormId}</code>)
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function makeQuestionKey(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
