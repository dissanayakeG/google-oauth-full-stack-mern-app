import { useEffect } from "react";
import { useAuth } from "../providers/AuthContext";
import api, { setApiToken } from "../api";

export default function Dashboard() {

    const { user, setUser, logout } = useAuth();

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });

                console.log('data', data);
                setApiToken(data.accessToken);

                const me = await api.get('/auth/me');
                setUser(me.data);

            } catch (error) {
                console.log('Auth bootstrap failed:', error);
                window.location.href = '/login';
            }
        }

        bootstrapAuth();

    }, []);

    const handleLogout = () => {
        logout()
    }


    if (!user) return <div>Loading...</div>;

    return (
        <>
            <div>Welcome {user.name}</div>
            <button onClick={handleLogout}>Logout</button>
        </>
    );
}