import { useQuery } from "@tanstack/react-query";
import api from "../../api";
import { Outlet } from "react-router-dom";
import LoadingSkeleton from "../app/app-loading-skeleton";
import Error from "../app/app-error";

export default function AuthLayout() {

    const fetchUser = async () => {
        const { data } = await api.get('/auth/me');
        return data;
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["auth me"],
        queryFn: () => fetchUser(),
    });

    if (isLoading) return <LoadingSkeleton />;
    if (error) return <Error error={error as Error} onRetry={() => refetch()} />;

    return (
        <main className="h-[100dvh] bg-white">
            <Outlet />
        </main>
    );
}