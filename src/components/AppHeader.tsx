import { Menu } from 'lucide-react';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">hot takes</h1>
      <button
        onClick={onMenuClick}
        className="text-gray-600 hover:text-gray-900 transition"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
    </div>
  );
}
