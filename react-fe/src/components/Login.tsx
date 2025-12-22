import api from "../api";

export default function Login() {

    const handleAddUser = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        // api.get('/auth/google');
        window.location.href = 'http://localhost:5000/api/v1/auth/google';


    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-red-600">Login</h1>
            <button onClick={handleAddUser}>Add user</button>
        </div>
    );
}