import { Mail } from 'lucide-react';
import type { Email } from '@/features/emails/types/index.type';
import { EmailItem } from '@/features/emails/components/email-item';

interface EmailListProps {
  emails: Email[];
  onEmailClick: (emailId: string) => void;
}

export function EmailList({ emails, onEmailClick }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="p-20 text-center">
        <Mail className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-gray-500">Your inbox is empty.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {emails.map((email) => (
        <EmailItem key={email.id} email={email} onClick={onEmailClick} />
      ))}
    </div>
  );
}
