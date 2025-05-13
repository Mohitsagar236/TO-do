import React, { useState, useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import {
  Users,
  Plus,
  Settings,
  Bell,
  BarChart2,
  MessageSquare,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function TeamPanel() {
  const {
    teams,
    currentTeam,
    members,
    activities,
    fetchTeams,
    createTeam,
    inviteMember,
    updateMemberRole,
    removeMember,
  } = useTeamStore();

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeam(newTeam);
      setShowCreateTeam(false);
      setNewTeam({ name: '', description: '' });
      toast.success('Team created successfully!');
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    try {
      await inviteMember(currentTeam.id, inviteEmail, selectedRole);
      setShowInvite(false);
      setInviteEmail('');
      toast.success('Invitation sent successfully!');
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Team Sidebar */}
      <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">Teams</h2>
          <Button onClick={() => setShowCreateTeam(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Team
          </Button>
        </div>

        <div className="space-y-2">
          {teams.map(team => (
            <div
              key={team.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentTeam?.id === team.id
                  ? 'bg-blue-50 dark:bg-blue-900'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  src={team.avatarUrl}
                  fallback={team.name.charAt(0)}
                  className="w-8 h-8"
                />
                <div>
                  <h3 className="font-medium dark:text-white">{team.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {team.members.length} members
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-9 space-y-6">
        {/* Team Header */}
        {currentTeam && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={currentTeam.avatarUrl}
                  fallback={currentTeam.name.charAt(0)}
                  className="w-12 h-12"
                />
                <div>
                  <h1 className="text-2xl font-bold dark:text-white">
                    {currentTeam.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentTeam.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setShowInvite(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Invite
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Team Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasks</p>
                <h3 className="text-2xl font-bold dark:text-white">24</h3>
              </div>
              <BarChart2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                <h3 className="text-2xl font-bold dark:text-white">
                  {members.length}
                </h3>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comments
                </p>
                <h3 className="text-2xl font-bold dark:text-white">128</h3>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due Soon
                </p>
                <h3 className="text-2xl font-bold dark:text-white">5</h3>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Team Members</h2>
          <div className="space-y-4">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={member.avatarUrl}
                    fallback={member.name.charAt(0)}
                    className="w-8 h-8"
                  />
                  <div>
                    <h3 className="font-medium dark:text-white">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={member.role}
                    onChange={e =>
                      updateMemberRole(member.id, e.target.value as any)
                    }
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 py-2"
              >
                <div className="flex-shrink-0">
                  <Avatar
                    src={activity.user.avatarUrl}
                    fallback={activity.user.name.charAt(0)}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm dark:text-white">
                    <span className="font-medium">{activity.user.name}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Create New Team
            </h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">
                  Team Name
                </label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={e =>
                    setNewTeam({ ...newTeam, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={newTeam.description}
                  onChange={e =>
                    setNewTeam({ ...newTeam, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateTeam(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Team</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Invite Team Member
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as any)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInvite(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Send Invite</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}