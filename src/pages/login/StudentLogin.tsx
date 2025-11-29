import { useState } from "react";
import { loginEmail, loginGoogle, getUserRole } from "@/firebase";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const login = async (user) => {
    const role = await getUserRole(user.uid);
    if (role === "STUDENT") {
      window.location.href = "/student/dashboard";
    } else {
      setErr("This account is not a student.");
    }
  };

  return (
    <div className="login-box">
      <h2>Student Login</h2>
      {err && <p style={{ color: "red" }}>{err}</p>}

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPass(e.target.value)} />

      <button
        onClick={async () => {
          try {
            const res = await loginEmail(email, pass);
            login(res.user);
          } catch (e) {
            setErr(e.message);
          }
        }}
      >
        Login
      </button>

      <button
        onClick={async () => {
          try {
            const res = await loginGoogle();
            login(res.user);
          } catch (e) {
            setErr(e.message);
          }
        }}
      >
        Login with Google
      </button>
    </div>
  );
}
