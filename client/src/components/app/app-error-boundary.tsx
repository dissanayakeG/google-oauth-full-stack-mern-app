import type { FallbackProps } from "react-error-boundary";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export function MainErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg m-4">
      <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
      <h2 className="text-lg font-bold text-red-800">Something went wrong</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        <RefreshCcw size={16} /> Try Again
      </button>
    </div>
  );
}