import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import type { UserProfile } from '../types';
import { getLeaderboard, getProfile } from '../utils/api';

export function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const [leaderboardData, profileData] = await Promise.all([
        getLeaderboard(),
        getProfile()
      ]);
      
      setLeaderboard(leaderboardData);
      setCurrentUser(profileData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const currentUserRank = leaderboard.findIndex(p => p.id === currentUser?.id) + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-500">#{rank}</div>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl mb-2 flex items-center gap-2">
          <Trophy className="w-7 h-7" />
          Leaderboard
        </h1>
        <p className="text-green-100">Top sustainability champions</p>
      </div>

      {/* Your Rank */}
      {currentUserRank > 0 && (
        <Card className="border-green-500 border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Rank</p>
                  <p className="text-xl">#{currentUserRank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">CO₂ Saved</p>
                <p className="text-xl text-green-600">
                  {((currentUser?.totalCO2Saved || 0) / 1000).toFixed(2)} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <div className="flex-1 text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                  <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm truncate">{leaderboard[1].name}</p>
                  <p className="text-xs text-gray-600">
                    {((leaderboard[1].totalCO2Saved || 0) / 1000).toFixed(2)} kg
                  </p>
                </div>
                <div className="h-16 bg-gray-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex-1 text-center">
                <div className="bg-yellow-100 rounded-lg p-4 mb-2">
                  <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm truncate">{leaderboard[0].name}</p>
                  <p className="text-xs text-gray-600">
                    {((leaderboard[0].totalCO2Saved || 0) / 1000).toFixed(2)} kg
                  </p>
                </div>
                <div className="h-24 bg-yellow-400 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex-1 text-center">
                <div className="bg-orange-100 rounded-lg p-4 mb-2">
                  <Medal className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm truncate">{leaderboard[2].name}</p>
                  <p className="text-xs text-gray-600">
                    {((leaderboard[2].totalCO2Saved || 0) / 1000).toFixed(2)} kg
                  </p>
                </div>
                <div className="h-12 bg-orange-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-xl">3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>All Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getRankBgColor(index + 1)} ${
                user.id === currentUser?.id ? 'border-green-500 border-2' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <span className="text-green-600 ml-2">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user.journeyCount} {user.journeyCount === 1 ? 'journey' : 'journeys'}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-green-600">
                  {((user.totalCO2Saved || 0) / 1000).toFixed(2)} kg
                </p>
                <p className="text-xs text-gray-600">CO₂ saved</p>
              </div>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No rankings yet</p>
              <p className="text-sm">Be the first to complete a journey!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
