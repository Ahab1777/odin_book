import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./app/pages/Home.tsx";
import Login from "./app/pages/Login.tsx";
import { requireUser } from "./app/loaders/authLoader.ts";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    loader: requireUser,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ]
  },
  {
    path: '/login',
    element: <Login/>
  }
])



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
