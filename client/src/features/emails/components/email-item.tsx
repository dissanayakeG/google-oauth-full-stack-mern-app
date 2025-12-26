import { ChevronRight } from 'lucide-react';
import type { Email } from '@/features/emails/types/index.type';

interface EmailItemProps {
  email: Email;
  onClick: (emailId: string) => void;
}

function formatSenderName(sender: string): string {
  const match = sender.match(/^"?([^"<]+)"?\s*(?:<.+>)?$/);
  return match ? match[1].trim() : sender.replace(/[<>]/g, '');
}

export function EmailItem({ email, onClick }: EmailItemProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-blue-50/50 cursor-pointer transition-all group"
      onClick={() => onClick(email.id)}
    >
      <div className={`w-2 h-2 rounded-full ${!email.isRead ? 'bg-blue-600' : 'bg-transparent'}`} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span
            className={`text-sm ${!email.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}
          >
            {formatSenderName(email.sender)}
          </span>
          <span className="text-xs text-gray-400 uppercase">
            {new Date(email.dateReceived).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <p
          className={`text-sm truncate font-bold ${!email.isRead ? 'text-blue-800' : 'text-gray-800'}`}
        >
          {email.subject}
        </p>

        <p className="text-sm text-gray-400 truncate mt-0.5">{email.snippet}</p>
      </div>

      <ChevronRight
        className="text-gray-300 group-hover:text-blue-400 transition-colors"
        size={18}
      />
    </div>
  );
}
