import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/context";

const API_BASE = "http://localhost:5000";

export default function ResponsesList() {
  const { token } = useAuth();
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/forms/${formId}/responses`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResponses(res.data.responses || []);
      } catch (err) {
        console.error("Error fetching responses:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchResponses();
  }, [token, formId]);

  if (!token) return <p>Please login first.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2>Responses for Form: {formId}</h2>
      
      {responses.length === 0 ? (
        <p>No responses found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Submission ID</th>
              <th>Created At</th>
              <th>Answers Preview</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r._id}>
                <td>{r._id}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  {Object.entries(r.answers)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")
                    .slice(0, 50)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
