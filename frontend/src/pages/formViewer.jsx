// src/pages/FormViewer.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/context";
import { shouldShowQuestion } from "../utils/conditional";

const API_BASE = "http://localhost:5000";

export default function FormViewer() {
  const { token } = useAuth();
  const { formId } = useParams();

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/forms/${formId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setForm(res.data);
      } catch (err) {
        console.error("Error fetching form:", err.response?.data || err.message);
        setMessage("Failed to load form.");
      } finally {
        setLoading(false);
      }
    };

    if (token && formId) {
      fetchForm();
    }
  }, [token, formId]);

  const handleChange = (q, e) => {
    const value = e.target.value;

    setAnswers((prev) => ({
      ...prev,
      [q.questionKey]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setErrors([]);

    try {
      const res = await axios.post(
        `${API_BASE}/forms/${formId}/responses`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Submit response:", res.data);
      setMessage("Response submitted successfully!");
      setAnswers({});
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage("Failed to submit response.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return <p style={{ padding: "2rem" }}>Please log in first.</p>;
  }

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading form...</p>;
  }

  if (!form) {
    return <p style={{ padding: "2rem" }}>Form not found.</p>;
  }

  const visibleQuestions = form.questions.filter((q) =>
    shouldShowQuestion(q.conditionalRules, answers)
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>{form.title}</h2>
      <p style={{ color: "#666" }}>
        Base: {form.airtableBaseId} | Table: {form.airtableTableId}
      </p>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {errors.length > 0 && (
        <ul style={{ color: "red" }}>
          {errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        {visibleQuestions.map((q) => (
          <div
            key={q.questionKey}
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              {q.label} {q.required && <span style={{ color: "red" }}>*</span>}
            </label>

            {q.type === "shortText" && (
              <input
                type="text"
                value={answers[q.questionKey] || ""}
                onChange={(e) => handleChange(q, e)}
                style={{ width: "100%", padding: "0.4rem" }}
              />
            )}

            {q.type === "longText" && (
              <textarea
                rows={3}
                value={answers[q.questionKey] || ""}
                onChange={(e) => handleChange(q, e)}
                style={{ width: "100%", padding: "0.4rem" }}
              />
            )}

            {q.type === "singleSelect" && (
              <select
                value={answers[q.questionKey] || ""}
                onChange={(e) => handleChange(q, e)}
                style={{ width: "100%", padding: "0.4rem" }}
              >
                <option value="">-- Select an option --</option>
                {q.options?.map((opt) => (
                  <option key={opt.id} value={opt.name}>
                    {opt.name}
                  </option>
                ))}
              </select>
            )}

            {q.type === "attachment" && (
              <input
                type="text"
                placeholder="Attachment URL (dev mode)"
                value={answers[q.questionKey] || ""}
                onChange={(e) => handleChange(q, e)}
                style={{ width: "100%", padding: "0.4rem" }}
              />
            )}
          </div>
        ))}

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
