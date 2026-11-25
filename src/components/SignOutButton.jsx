import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileContext } from "../context/ProfileContext";

function SignOutButton({ className = "" }) {
  const { logout } = useProfileContext();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    setError("");
    setBusy(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`signout-container ${className}`}>
      <button type="button" className="signout-button" onClick={handleSignOut} disabled={busy}>
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error && <span className="signout-error" role="alert">{error}</span>}
    </div>
  );
}

export default SignOutButton;
