import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const SetFacultyPassword = () => {
  const [params] = useSearchParams();
  const email = params.get("email");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/faculty/set-password`, null, {
        params: { email, password },
      });
      setMsg("Password set successfully! You can now log in.");
    } catch (err) {
      setMsg("Error setting password");
    }
  };

  return (

    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl mb-4 font-bold">Set Your Password</h2>
      {msg && <p className="mb-4">{msg}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          className="border px-4 py-2 mb-4 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Set Password
        </button>
      </form>
    </div>
  );
};

export default SetFacultyPassword;
