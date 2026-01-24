import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { VotingTab } from './components/VotingTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { SubmissionTab } from './components/SubmissionTab';
import { AppHeader } from './components/AppHeader';
import { TabBar } from './components/TabBar';
import './App.css';

type AuthScreen = 'login' | 'register' | 'app';
type TabType = 'voting' | 'leaderboard' | 'submission';

function App() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activeTab, setActiveTab] = useState<TabType>('voting');

  const handleSwitchToRegister = () => {
    setAuthScreen('register');
  };

  const handleSwitchToLogin = () => {
    setAuthScreen('login');
  };

  const handleLoginSuccess = () => {
    setAuthScreen('app');
  };

  const handleRegisterSuccess = () => {
    setAuthScreen('app');
  };

  const handleLogout = () => {
    setAuthScreen('login');
    setActiveTab('voting');
  };

  return (
    <>
      {authScreen === 'login' && (
        <LoginScreen
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {authScreen === 'register' && (
        <RegisterScreen
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      {authScreen === 'app' && (
        <div className="relative w-full">
          {/* App Header */}
          <AppHeader onLogout={handleLogout} />
          
          {/* Tab Content */}
          {activeTab === 'voting' && <VotingTab onLogout={handleLogout} />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'submission' && <SubmissionTab />}

          {/* Tab Bar */}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}
    </>
  );
}

export default App;
