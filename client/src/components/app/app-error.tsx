import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error?: Error | null;
  onRetry?: () => void;
  message?: string;
}

export default function Error({ error, onRetry, message }: ErrorProps) {
  const errorMessage = message || error?.message || 'An unexpected error occurred';

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 text-red-600 p-4 rounded-full">
            <AlertCircle size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Oops!</h1>

        <p className="text-gray-600 mb-6">{errorMessage}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
