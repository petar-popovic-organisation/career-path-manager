import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUserManagement, UserWithDetails } from '@/hooks/useUserManagement';
import { AppRole, ROLE_LABELS } from '@/types/auth';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, ArrowLeft, RefreshCw, UserX, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const UserManagement = () => {
  const { role, loading: authLoading } = useAuthContext();
  const { users, loading, error, refetch, toggleUserActive, assignRole, removeRole } = useUserManagement();
  const { toast } = useToast();
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  // Only director_of_engineering can access this page
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== 'director_of_engineering') {
    return <Navigate to="/" replace />;
  }

  const handleToggleActive = async (user: UserWithDetails) => {
    setUpdatingUsers(prev => new Set(prev).add(user.userId));
    try {
      await toggleUserActive(user.userId, !user.isActive);
      toast({
        title: user.isActive ? 'User Disabled' : 'User Enabled',
        description: `${user.fullName || user.email} has been ${user.isActive ? 'disabled' : 'enabled'}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.userId);
        return newSet;
      });
    }
  };

  const handleRoleChange = async (user: UserWithDetails, newRole: string) => {
    setUpdatingUsers(prev => new Set(prev).add(user.userId));
    try {
      if (newRole === 'none') {
        await removeRole(user.userId);
        toast({
          title: 'Role Removed',
          description: `Role removed from ${user.fullName || user.email}.`,
        });
      } else {
        await assignRole(user.userId, newRole as AppRole);
        toast({
          title: 'Role Assigned',
          description: `${ROLE_LABELS[newRole as AppRole]} role assigned to ${user.fullName || user.email}.`,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.userId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">User Management</h1>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-muted-foreground" />
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage user accounts, roles, and access permissions
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-destructive text-center py-4">
                Error loading users: {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(user => (
                      <TableRow key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {user.fullName || 'No name'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role || 'none'}
                            onValueChange={(value) => handleRoleChange(user, value)}
                            disabled={updatingUsers.has(user.userId)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">No Role</span>
                              </SelectItem>
                              <SelectItem value="hr_office">HR Office</SelectItem>
                              <SelectItem value="team_lead">Team Lead</SelectItem>
                              <SelectItem value="director_of_engineering">Director of Engineering</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                              <UserX className="h-3 w-3 mr-1" />
                              Disabled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm text-muted-foreground mr-2">
                              {user.isActive ? 'Enabled' : 'Disabled'}
                            </span>
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleToggleActive(user)}
                              disabled={updatingUsers.has(user.userId)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserManagement;
