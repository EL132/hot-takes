import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { VotingTab } from './components/VotingTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { SubmissionTab } from './components/SubmissionTab';
import { AppHeader } from './components/AppHeader';
import { TabBar } from './components/TabBar';
import { ProfileModal } from './components/ProfileModal';
import { clearAuthToken, clearUserId } from './auth';
import { useUser } from './context/useUser';
import './App.css';

type AuthScreen = 'login' | 'register' | 'app';
type TabType = 'voting' | 'leaderboard' | 'submission';

function AppContent() {
  const { setUserId, setUsername, clearInteractions, setSessionVotes, setLifetimeVotes, setOpinionCount, setOpinionIds } =
    useUser();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activeTab, setActiveTab] = useState<TabType>('voting');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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
    clearAuthToken();
    clearUserId();
    setUserId(null);
    setUsername(null);
    clearInteractions();
    setSessionVotes(0);
    setLifetimeVotes(0);
    setOpinionCount(0);
    setOpinionIds([]);
    setAuthScreen('login');
    setActiveTab('voting');
    setProfileModalOpen(false);
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
          <AppHeader onMenuClick={() => setProfileModalOpen(true)} />
          
          {/* Profile Modal */}
          <ProfileModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            onLogout={handleLogout}
          />
          
          {/* Tab Content */}
          {activeTab === 'voting' && <VotingTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'submission' && <SubmissionTab />}

          {/* Tab Bar */}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}
    </>
  );
}

function App() {
  return (
      <AppContent />
  );
}

export default App;
