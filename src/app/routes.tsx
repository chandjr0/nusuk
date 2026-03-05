import { createBrowserRouter } from "react-router";
import InputForm from "./components/InputForm";
import PrivilegeCard from "./components/PrivilegeCard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <InputForm />,
  },
  {
    path: "/card",
    element: <PrivilegeCard />,
  },
]);
