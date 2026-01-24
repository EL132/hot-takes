import { BarChart3, MessageSquare, Send } from 'lucide-react';

type TabType = 'voting' | 'leaderboard' | 'submission';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'voting', label: 'Vote', icon: <MessageSquare size={24} /> },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: <BarChart3 size={24} />,
    },
    { id: 'submission', label: 'Submit', icon: <Send size={24} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
      <div className="flex justify-around max-w-4xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="text-xs font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
