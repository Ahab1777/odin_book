import "./App.css";
import { Outlet } from "react-router";
import Navbar from "./app/components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <div className="
      pt-24
      app-layout
      min-h-screen
      flex
      flex-col 
      max-w-240 
      mx-auto
      w-full">
        <Outlet />
      </div>
    </>
  );
}

export default App;
