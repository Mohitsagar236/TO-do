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
  Calendar,
  CheckCircle,
  Target,
  TrendingUp,
  Award,
  Star,
  Filter,
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'editor' | 'viewer'>('all');

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

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const teamStats = {
    totalTasks: 24,
    completedTasks: 18,
    upcomingDeadlines: 5,
    activeMembers: members.length,
  };

  const memberStats = {
    admins: members.filter(m => m.role === 'admin').length,
    editors: members.filter(m => m.role === 'editor').length,
    viewers: members.filter(m => m.role === 'viewer').length,
  };

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-2" />
            <h2 className="text-2xl font-bold">Teams</h2>
          </div>
          <Button
            onClick={() => setShowCreateTeam(true)}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Team
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team List */}
        <div className="lg:col-span-3 space-y-4">
          {teams.map(team => (
            <div
              key={team.id}
              className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer ${
                currentTeam?.id === team.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  src={team.avatarUrl}
                  fallback={team.name.charAt(0)}
                  className="w-10 h-10"
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

        {/* Team Details */}
        <div className="lg:col-span-9 space-y-6">
          {currentTeam ? (
            <>
              {/* Team Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Task Progress</p>
                      <h3 className="text-2xl font-bold">
                        {Math.round((teamStats.completedTasks / teamStats.totalTasks) * 100)}%
                      </h3>
                    </div>
                    <CheckCircle className="w-8 h-8 text-white/80" />
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2"
                        style={{
                          width: `${(teamStats.completedTasks / teamStats.totalTasks) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Active Members</p>
                      <h3 className="text-2xl font-bold">{teamStats.activeMembers}</h3>
                    </div>
                    <Users className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="text-sm mt-2 opacity-90">
                    {memberStats.admins} admins • {memberStats.editors} editors
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Productivity</p>
                      <h3 className="text-2xl font-bold">92</h3>
                    </div>
                    <TrendingUp className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="text-sm mt-2 opacity-90">
                    15% increase this week
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Upcoming</p>
                      <h3 className="text-2xl font-bold">{teamStats.upcomingDeadlines}</h3>
                    </div>
                    <Calendar className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="text-sm mt-2 opacity-90">
                    Deadlines this week
                  </p>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold dark:text-white">Team Members</h2>
                    <Button onClick={() => setShowInvite(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search members..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value as any)}
                      className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admins</option>
                      <option value="editor">Editors</option>
                      <option value="viewer">Viewers</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMembers.map(member => (
                    <div key={member.id} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={member.avatarUrl}
                            fallback={member.name.charAt(0)}
                            className="w-10 h-10"
                          />
                          <div>
                            <h3 className="font-medium dark:text-white">{member.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={member.role}
                            onChange={e => updateMemberRole(member.id, e.target.value as any)}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredMembers.length === 0 && (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No members found matching your filters
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold dark:text-white">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activities.map(activity => (
                    <div key={activity.id} className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3">
                        <Avatar
                          src={activity.user.avatarUrl}
                          fallback={activity.user.name.charAt(0)}
                          className="w-8 h-8"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm dark:text-white">
                            <span className="font-medium">{activity.user.name}</span>{' '}
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <div className="p-8 text-center">
                      <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No recent activity
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No team selected
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Select a team from the list or create a new one
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={e => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Team</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300">Role</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as any)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInvite(false)}>
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