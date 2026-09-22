import { useState } from "react";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

export default function App() {
  const [username, setUsername] = useState(() => sessionStorage.getItem("meridian_user") || null);

  function handleLogin(user) {
    sessionStorage.setItem("meridian_user", user);
    setUsername(user);
  }

  function handleLogout() {
    sessionStorage.removeItem("meridian_user");
    setUsername(null);
  }

  return username ? (
    <Chat username={username} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}
