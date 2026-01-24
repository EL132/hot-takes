interface AppHeaderProps {
  onLogout: () => void;
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">hot takes</h1>
      <button
        onClick={onLogout}
        className="text-gray-600 hover:text-gray-900 font-medium transition"
      >
        Log Out
      </button>
    </div>
  );
}
