import { Loader2 } from 'lucide-react';

export function EmailLoading() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-gray-500 animate-pulse">Loading emails...</p>
    </div>
  );
}
