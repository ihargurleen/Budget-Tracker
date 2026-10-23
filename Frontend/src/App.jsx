import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from './Common/Layout';
import Signin from "./Pages/auth/Signin";
import Signup from "./Pages/auth/Signup";
import Budget from "./Pages/Budget";
import CreateBudget from "./Pages/CreateBudget";
import Dashboard from "./Pages/Dashboard";
import BudgetDetails from "./Pages/auth/budgetDetails";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./Utils/ProtectedRoute";
import Signout from "./Pages/auth/signout";
const App = () => {
  const router = createBrowserRouter([
{
  path: "/",
  element: <Layout/>,
  children: [
    {
      path: "/",
      element: <Dashboard/>
    },
    {
      path: "/budget",
      element: <Budget/>,
    },
    // {
    //   path: "/create-budget",
    //   element: <CreateBudget/>,
    // },

      {
      path: "/signin",
      element: <Signin/>,
    },
    {
      path: "/signup",
      element: <Signup/>,
    },
    {
       path: "/sign-out",
      element: <Signout/>,
    },
    {
      element: <ProtectedRoute/>,
      children:[
        {
          path: "/create-budget",
          element: <CreateBudget/>,
        },
        {
          path: "/budget/:budgetId",
          element: <BudgetDetails/>,
        }
      ]
    }
  ]
},
  ]);
 return(
  <>
  <AuthProvider>
    <RouterProvider router = {router} /> 
  </AuthProvider>
   </>
 );
}
export default App;