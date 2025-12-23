import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthContext";
import api from "../api";

export default function Dashboard() {

    const { user, setUser, logout } = useAuth();
    const [labels, setLabels] = useState<any[]>([]);
    const [emails, setEmails] = useState<any[]>([]);

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
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

    const handleFetchLabels = async () => {
        try {
            const labelsRes = await api.get('/email/labels');
            setLabels(labelsRes.data.labels);
            console.log('Labels:', labelsRes.data.labels);
        } catch (error) {
            console.error('Failed to fetch Gmail labels:', error);
        }
    }

    const handleFetchEmails = async () => {
        try {
            const emailsRes = await api.get('/email/fetch');
            setEmails(emailsRes.data.emails);
            console.log('Emails:', emailsRes.data.emails);
        } catch (error) {
            console.error('Failed to fetch Gmail emails:', error);
        }
    }

    const handleFetchEmailsDB = async () => {
        try {
            const emailsRes = await api.get('/email/list');
            setEmails(emailsRes.data.emails);
            console.log('Emails:', emailsRes.data.emails);
        } catch (error) {
            console.error('Failed to fetch Gmail emails:', error);
        }
    }


    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Welcome {user.name}</h2>
            <div style={{ marginBottom: '20px' }}>
                <button onClick={handleLogout}>Logout</button>
                <button onClick={handleFetchLabels}>Fetch Labels</button>
                <button onClick={handleFetchEmails}>Fetch Emails</button>
                <button onClick={handleFetchEmailsDB}>Fetch Emails DB</button>
            </div>

            <div style={{ display: 'flex', gap: '40px' }}>
                {labels.length > 0 && (
                    <div>
                        <h3>Labels</h3>
                        <ul>
                            {labels.map((label) => (
                                <li key={label.id}>{label.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {emails.length > 0 && (
                    <div>
                        <h3>Recent Emails</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {emails.map((email) => (
                                <div key={email.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{email.subject}</div>
                                    <div style={{ fontSize: '0.9em', color: '#666' }}>From: {email.from}</div>
                                    <div style={{ fontSize: '0.8em', marginTop: '5px' }}>{email.snippet}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}