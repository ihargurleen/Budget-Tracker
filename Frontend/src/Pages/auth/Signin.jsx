import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";

const Signin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const user = await login(loginData);

            if (user) {
                navigate("/", { replace: true });
            } else {
                setError("Login failed. Please check your email and password.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="signin">
            <div>
                <form onSubmit={handleSubmit} id="form">
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                    />

                    <br />

                    <label>Password</label>
                    <br />
                    <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                    />

                    <br />
                    <br />

                    {error && <p>{error}</p>}

                    <input
                        type="submit"
                        value={loading ? "Signing in..." : "Login"}
                        disabled={loading}
                    />
                </form>
            </div>
        </div>
    );
};

export default Signin;