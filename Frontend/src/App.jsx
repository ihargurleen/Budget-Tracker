import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Common/Layout.jsx";
import Signin from "./Pages/auth/Signin.jsx";
import Signup from "./Pages/auth/Signup.jsx";
import Budget from "./Pages/Budget.jsx";
import CreateBudget from "./Pages/CreateBudget.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import BudgetDetails from "./Pages/auth/BudgetDetails.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import ProtectedRoute from "./Utils/ProtectedRoute.jsx";
import Signout from "./Pages/auth/Signout.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "signin",
                element: <Signin />
            },
            {
                path: "signup",
                element: <Signup />
            },
            {
                path: "sign-out",
                element: <Signout />
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />
                    },
                    {
                        path: "budget",
                        element: <Budget />
                    },
                    {
                        path: "create-budget",
                        element: <CreateBudget />
                    },
                    {
                        path: "budget/:budgetId",
                        element: <BudgetDetails />
                    }
                ]
            }
        ]
    }
]);

const App = () => {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
};

export default App;