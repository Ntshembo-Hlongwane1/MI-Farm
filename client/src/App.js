import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import cookiejs from "cookiejs.js";
function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const user = cookiejs.get("SESS_NAME");
  console.log(user, "USER");
  const login = () => {
    const data = new FormData();
    data.append("username", username);
    data.append("password", password);

    axios.post("http://localhost:5000/api/user-login", data, {
      withCredentials: true,
    });
  };
  return (
    <div className="App">
      <input
        type="text"
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="pass"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={login}>LOGIN</button>
    </div>
  );
}

export default App;
