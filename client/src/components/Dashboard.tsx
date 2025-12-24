import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { LogOut, Mail, Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "../providers/AuthContext";
import api from "../api";
import { MainErrorFallback } from "../components/ErrorBoundary";
import { useState, useEffect } from "react";

const fetchEmails = async (offset: number, limit: number, search: string = '') => {
    const { data } = await api.get('/email/list', {
        params: { offset, limit, search }
    });
    return data;
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const limit = 5;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setOffset(0);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["emails", offset, limit, debouncedSearch],
        queryFn: () => fetchEmails(offset, limit, debouncedSearch),
    });

    const handleSearchEmails = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    }

    const handleNextPage = () => {
        if (data?.hasMore) {
            setOffset(offset + limit);
        }
    }

    const handlePrevPage = () => {
        if (offset > 0) {
            setOffset(Math.max(0, offset - limit));
        }
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                        <div className="bg-blue-600 text-white p-1 rounded">
                            <Mail size={20} />
                        </div>
                        <span>G Mail</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <section className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                   <input 
                       className="w-full border border-gray-300 text-gray-500 rounded-md p-2" 
                       placeholder="Search emails..." 
                       value={search}
                       onChange={handleSearchEmails}
                   />
                </div>
            </section>

            <main className="max-w-6xl mx-auto p-4 md:p-8 min-h-[60vh]">
                <div className="mb-6 flex justify-between items-end">
                    <h2 className="text-2xl font-semibold text-gray-800">Inbox</h2>
                    <span className="text-sm text-gray-500">{data?.emails?.length || 0} messages</span>
                </div>

                <ErrorBoundary FallbackComponent={MainErrorFallback} onReset={() => refetch()}>
                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                            <p className="text-gray-500 animate-pulse">Loading emails...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="divide-y divide-gray-100">
                                    {data?.emails?.length === 0 ? (
                                        <div className="p-20 text-center">
                                            <Mail className="mx-auto text-gray-300 mb-4" size={48} />
                                            <p className="text-gray-500">Your inbox is empty.</p>
                                        </div>
                                    ) : (
                                        data?.emails?.map((email: any) => (
                                            <div
                                                key={email.id}
                                                className="flex items-center gap-4 p-4 hover:bg-blue-50/50 cursor-pointer transition-all group"
                                            >
                                                <div className={`w-2 h-2 rounded-full ${!email.isRead ? 'bg-blue-600' : 'bg-transparent'}`} />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className={`text-sm ${!email.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                            {email.sender}
                                                        </span>
                                                        <span className="text-xs text-gray-400 uppercase">
                                                            {new Date(email.dateReceived).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>

                                                    <p className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                        {email.subject}
                                                    </p>

                                                    <p className="text-sm text-gray-400 truncate mt-0.5">
                                                        {email.snippet}
                                                    </p>
                                                </div>

                                                <ChevronRight className="text-gray-300 group-hover:text-blue-400 transition-colors" size={18} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Paginations */}
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={offset === 0}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {Math.floor(offset / limit) + 1} of {data?.total ? Math.ceil(data.total / limit) : 1}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={!data?.hasMore}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </ErrorBoundary>
            </main>
        </div>
    );
}