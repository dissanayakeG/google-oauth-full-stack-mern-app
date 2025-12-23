import {createBrowserRouter} from "react-router-dom";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/dashboard",
        element: <Dashboard />
    }
])