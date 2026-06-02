'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/lib/notification-store';
import { userService } from '@/lib/user-service';
import { User } from '@/types';

export default function UserManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'partner')) {
      router.replace('/auth/login');
      return;
    }
    
    loadUsers();
  }, [isAuthenticated, isLoading, router, user?.role]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    setFilteredUsers(users.filter(u => 
      u.name.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term)
    ));
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      addNotification({ type: 'error', message: 'Erreur lors du chargement des utilisateurs' });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      addNotification({ type: 'success', message: 'Utilisateur supprimé avec succès' });
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification({ type: 'error', message: 'Erreur lors de la suppression' });
    }
  };

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'partner':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'partner':
        return 'Partenaire';
      default:
        return 'Joueur';
    }
  };

  if (isLoading || isLoadingUsers) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)] px-4 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <Card className="w-full space-y-4 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Gestion des utilisateurs</div>
            <h1 className="text-3xl font-bold text-dark">Chargement...</h1>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)]">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient opacity-90" />
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                Administration
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-dark">Gestion des utilisateurs</h1>
            </div>
            <Button variant="outline" onClick={() => router.push('/partner-studio')}>
              Retour
            </Button>
          </div>

          <Card className="border border-white/70 bg-white/90">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={loadUsers}>Rafraîchir</Button>
            </div>
          </Card>

          <Card className="border border-white/70 bg-white/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Points
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Niveau
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Inscription
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-dark">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {user.points.toLocaleString()} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        Niveau {user.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push(`/profile/${user.id}`)}
                          >
                            Voir
                          </Button>
                          {user?.role !== 'admin' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteUser(user.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-slate-500">Aucun utilisateur trouvé</p>
              </div>
            )}
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
