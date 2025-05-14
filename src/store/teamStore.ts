import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';

interface Team {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  createdAt: Date;
  members: TeamMember[];
  settings: any;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
  joinedAt: Date;
}

interface Activity {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  metadata: any;
  createdAt: Date;
}

interface TeamStore {
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  createTeam: (team: { name: string; description?: string }) => Promise<void>;
  inviteMember: (teamId: string, email: string, role: TeamMember['role']) => Promise<void>;
  updateMemberRole: (memberId: string, role: TeamMember['role']) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  fetchActivities: (teamId: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  currentTeam: null,
  members: [],
  activities: [],
  loading: false,
  error: null,

  fetchTeams: async () => {
    try {
      set({ loading: true });

      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            id,
            user_id,
            role,
            joined_at,
            team_member_users!team_members_user_id_fkey!inner (
              id,
              email,
              name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        teams: teams.map(team => ({
          ...team,
          createdAt: new Date(team.created_at),
          members: team.team_members.map((member: any) => ({
            id: member.id,
            name: member.team_member_users.name || member.team_member_users.email.split('@')[0],
            email: member.team_member_users.email,
            role: member.role,
            avatarUrl: member.team_member_users.avatar_url,
            joinedAt: new Date(member.joined_at),
          })),
        })),
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching teams:', error);
      set({ error: 'Failed to fetch teams', loading: false });
    }
  },

  createTeam: async (team) => {
    try {
      const user = useUserStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .insert([
          {
            name: team.name,
            description: team.description,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: data.id,
            user_id: user.id,
            role: 'admin',
          },
        ]);

      if (memberError) throw memberError;

      await get().fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      set({ error: 'Failed to create team' });
    }
  },

  inviteMember: async (teamId, email, role) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('team_member_users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      const { error } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: teamId,
            user_id: userData.id,
            role,
            invited_by: useUserStore.getState().user?.id,
          },
        ]);

      if (error) throw error;

      await get().fetchTeams();
    } catch (error) {
      console.error('Error inviting member:', error);
      set({ error: 'Failed to invite member' });
    }
  },

  updateMemberRole: async (memberId, role) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      await get().fetchTeams();
    } catch (error) {
      console.error('Error updating member role:', error);
      set({ error: 'Failed to update member role' });
    }
  },

  removeMember: async (memberId) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await get().fetchTeams();
    } catch (error) {
      console.error('Error removing member:', error);
      set({ error: 'Failed to remove member' });
    }
  },

  fetchActivities: async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_activities')
        .select(`
          *,
          team_member_users!team_members_user_id_fkey!inner (
            id,
            name,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      set({
        activities: data.map((activity: any) => ({
          id: activity.id,
          user: {
            id: activity.team_member_users.id,
            name: activity.team_member_users.name,
            avatarUrl: activity.team_member_users.avatar_url,
          },
          action: activity.action,
          entityType: activity.entity_type,
          entityId: activity.entity_id,
          metadata: activity.metadata,
          createdAt: new Date(activity.created_at),
        })),
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      set({ error: 'Failed to fetch activities' });
    }
  },
}));