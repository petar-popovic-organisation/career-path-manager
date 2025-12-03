import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/types/auth';

export interface UserWithDetails {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  createdAt: string;
  role: AppRole | null;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithDetails[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          id: profile.id,
          userId: profile.user_id,
          email: profile.email,
          fullName: profile.full_name,
          isActive: profile.is_active,
          createdAt: profile.created_at,
          role: userRole?.role as AppRole | null,
        };
      });

      setUsers(usersWithRoles);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('user_id', userId);

    if (error) throw error;
    
    setUsers(prev => prev.map(user => 
      user.userId === userId ? { ...user, isActive } : user
    ));
  };

  const assignRole = async (userId: string, role: AppRole) => {
    // First check if user already has a role
    const existingUser = users.find(u => u.userId === userId);
    
    if (existingUser?.role) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
    } else {
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    }

    setUsers(prev => prev.map(user => 
      user.userId === userId ? { ...user, role } : user
    ));
  };

  const removeRole = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    setUsers(prev => prev.map(user => 
      user.userId === userId ? { ...user, role: null } : user
    ));
  };

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    toggleUserActive,
    assignRole,
    removeRole,
  };
};
