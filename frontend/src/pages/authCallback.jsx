import { useEffect } from "react";
import { useAuth } from "../context/context";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    console.log("AuthCallback token from URL:", token);

    if (token) {
      login(token);
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [login, navigate]);

  return <p>Logging you in...</p>;
}
