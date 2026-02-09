import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./app/pages/Home.tsx";
import Login from "./app/pages/Login.tsx";
import { requireUser } from "./app/loaders/authLoader.ts";
import { loginLoader } from "./app/loaders/loginLoader.ts";
import CreateAccount from "./app/pages/CreateAccount.tsx";
import { AuthProvider } from "./app/AuthContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: requireUser,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
    loader: loginLoader,
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
