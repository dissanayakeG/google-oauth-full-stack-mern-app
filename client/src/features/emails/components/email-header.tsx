import { Mail, LogOut } from 'lucide-react';
import type { User } from '@/types/user-type';

interface EmailHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function EmailHeader({ user, onLogout }: EmailHeaderProps) {
  return (
    <section className="bg-white border-b sticky top-0 z-10">
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
            onClick={onLogout}
            className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
