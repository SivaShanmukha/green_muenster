import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { RoutePlanner } from './components/RoutePlanner';
import { JourneyTracker } from './components/JourneyTracker';
import { JourneyHistory } from './components/JourneyHistory';
import { ProfileScreen } from './components/ProfileScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { BottomNav } from './components/BottomNav';
import { WelcomeModal } from './components/WelcomeModal';
import { Toaster } from './components/ui/sonner';
import { setAccessToken } from './utils/api';
import { getSupabaseClient } from './utils/supabase/client';
import type { RouteOption } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [journeyDetails, setJourneyDetails] = useState<{ from: string; to: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const supabase = getSupabaseClient();

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      setAccessToken(session.access_token);
      setIsAuthenticated(true);
    }
    
    setCheckingAuth(false);
  };

  const handleAuthSuccess = (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    setShowWelcome(true);
  };

  const handleLogout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setActiveTab('home');
    setActiveRoute(null);
  };

  const handleStartJourney = () => {
    setActiveTab('plan');
  };

  const handleViewHistory = () => {
    setActiveTab('history');
  };

  const handleSelectRoute = (route: RouteOption, from: string, to: string) => {
    setJourneyDetails({ from, to });
    setActiveRoute(route);
  };

  const handleCompleteJourney = () => {
    setActiveRoute(null);
    setJourneyDetails(null);
    setActiveTab('home');
  };

  const handleCancelJourney = () => {
    setActiveRoute(null);
    setJourneyDetails(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Green Münster...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        <div className="p-4">
          {activeRoute && journeyDetails ? (
            <JourneyTracker
              route={activeRoute}
              from={journeyDetails.from}
              to={journeyDetails.to}
              onComplete={handleCompleteJourney}
              onCancel={handleCancelJourney}
            />
          ) : (
            <>
              {activeTab === 'home' && <Dashboard onStartJourney={handleStartJourney} onViewHistory={handleViewHistory} />}
              {activeTab === 'plan' && <RoutePlanner onSelectRoute={handleSelectRoute} />}
              {activeTab === 'history' && <JourneyHistory />}
              {activeTab === 'leaderboard' && <LeaderboardScreen />}
              {activeTab === 'profile' && <ProfileScreen onLogout={handleLogout} />}
            </>
          )}
        </div>
        
        {!activeRoute && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
      </div>
      <Toaster />
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </div>
  );
}