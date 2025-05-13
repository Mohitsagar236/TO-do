import React from 'react';
import { useProgressStore } from '../store/progressStore';
import { Trophy, Star, Award, Zap } from 'lucide-react';

export function ProgressDisplay() {
  const { progress, leaderboard } = useProgressStore();

  if (!progress) return null;

  const xpToNextLevel = (progress.level * 100) ** 2;
  const xpProgress = (progress.xp / xpToNextLevel) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      {/* Level and XP */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold dark:text-white">
            Level {progress.level}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {progress.xp} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {xpToNextLevel - progress.xp} XP to next level
        </p>
      </div>

      {/* Streak */}
      <div className="flex items-center space-x-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        <span className="font-medium dark:text-white">
          {progress.streakDays} day streak
        </span>
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Badges ({progress.badges?.length ?? 0})
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {progress.badges?.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-2xl mr-3">{badge.icon}</span>
              <div>
                <h4 className="font-medium dark:text-white">{badge.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          Leaderboard
        </h3>
        <div className="space-y-2">
          {(leaderboard ?? []).map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center">
                <span className="w-6 text-center font-medium dark:text-white">
                  #{entry.rank}
                </span>
                <span className="ml-3 dark:text-white">{entry.userName}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Level {entry.level}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.xp} XP
                </span>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.badges}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confetti canvas for celebrations */}
      <canvas
        id="confetti-canvas"
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}