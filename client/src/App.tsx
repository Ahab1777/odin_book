import "./App.css";
import { Outlet } from "react-router";
import Navbar from "./app/components/Navbar";



function App() {
  return (
    <>
      <Navbar/>
  <Outlet/>
    </>
  );
}

export default App;
