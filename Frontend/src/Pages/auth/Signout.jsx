import { useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signout = () => {
    const { signout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            await signout();
            navigate("/signin", { replace: true });
        };

        logout();
    }, []);

    return <div>Signing out...</div>;
};

export default Signout;