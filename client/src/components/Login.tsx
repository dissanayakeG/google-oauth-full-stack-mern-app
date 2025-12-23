
export default function Login() {

    const handleLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

        window.location.href = `${apiUrl}/auth/google`
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-red-600">Login</h1>
            <button onClick={handleLogin}>Add user</button>
        </div>
    );
}