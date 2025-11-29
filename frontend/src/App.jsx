import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/context.jsx";

export default function App() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      console.log("Login button clicked");
      const res = await fetch("http://localhost:5000/auth/dev-token");
      const data = await res.json();
      console.log("Dev token response:", data);

      if (!data.token) {
        alert("No token received from backend, check console.");
        return;
      }

      login(data.token);      
      navigate("/dashboard");  
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed, check console.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Assignment Form Builder</h1>
      <p>Dev login (uses existing user in DB).</p>
      <button type="button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
