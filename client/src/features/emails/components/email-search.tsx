interface EmailSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmailSearch({ value, onChange }: EmailSearchProps) {
  return (
    <section className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <input
          className="w-full border border-gray-300 text-gray-500 rounded-md p-2"
          placeholder="Search emails..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </section>
  );
}
