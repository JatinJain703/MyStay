import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-40 text-center">
      <MessageCircle size={56} className="text-gray-300" />
      <h1 className="text-2xl font-semibold">Messages</h1>
      <p className="max-w-sm text-gray-500">
        Guest ↔ host messaging is coming soon. For this assignment it&apos;s a placeholder.
      </p>
      <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">Coming Soon</span>
    </div>
  );
}
