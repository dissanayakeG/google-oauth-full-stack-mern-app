import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api";

export default function MailBody() {
    const { id } = useParams();

    const [emailContent, setEmailContent] = useState<string>("");
    const [errorCode, setErrorCode] = useState<null | number>(null);


    useEffect(() => {
        const fetchEmailContent = async () => {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await api.get(`${apiUrl}/email/${id}`);

            if (response.data?.status !== 200) {
                setErrorCode(response.data?.status);
            }

            setEmailContent(response.data?.data?.body?.html);
        }
        fetchEmailContent();
    }, [id]);

    const errorEmailContent = () => {
        if (errorCode === 404) {
            return "Email not found.";
        } else if (errorCode === 500) {
            return "Unauthorized access. Please log in.";
        } else {
            return "An unexpected error occurred.";
        }
    }

    return (
        <div className="bg-white text-gray-900 shadow-sm border border-gray-200 p-4 h-full">
            {errorCode && errorCode !== 200 ? <div className="text-red-500 h-full">{errorEmailContent()}</div> : null}
            <div dangerouslySetInnerHTML={{ __html: emailContent }} />
        </div>
    );
}