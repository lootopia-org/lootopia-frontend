'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { InteractiveMap } from '@/components/InteractiveMap';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/lib/notification-store';
import { chaseService } from '@/lib/chase-service';
import { userService } from '@/lib/user-service';
import { Chase, User } from '@/types';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const [chases, setChases] = useState<Chase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.replace('/chases');
      return;
    }

    loadData();
  }, [isAuthenticated, isLoading, router, user?.role]);

  const loadData = async () => {
    try {
      const [chasesResult, usersResult] = await Promise.all([
        chaseService.getChases(1, 50),
        userService.getUsers(),
      ]);

      setChases(chasesResult.data);
      setUsers(usersResult);
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification({ type: 'error', message: 'Erreur lors du chargement' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const mapMarkers = [
    ...chases.map((chase) => ({
      id: `chase-${chase.id}`,
      position: [chase.location.latitude, chase.location.longitude] as [number, number],
      type: 'chase' as const,
      label: chase.title,
      description: `Difficulté: ${chase.difficulty} - Participants: ${chase.participants}`,
    })),
    ...users.map((user, index) => ({
      id: `user-${user.id}`,
      position: [37.808 + (index * 0.01), -122.417 - (index * 0.005)] as [number, number],
      type: 'user' as const,
      label: user.name ?? user.username,
      description: `Rôle: ${user.role} - Points: ${user.points ?? 0}`,
    })),
  ];

  const stats = [
    { label: 'Total chasses', value: chases.length, detail: 'Enregistrées' },
    { label: 'Total utilisateurs', value: users.length, detail: 'Inscrits' },
    { 
      label: 'Participants actifs', 
      value: users.filter(u => u.role === 'player').length, 
      detail: 'Joueurs' 
    },
    { label: 'Partenaires', value: users.filter(u => u.role === 'partner').length, detail: 'Actifs' },
  ];

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)] px-4 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <Card className="w-full space-y-4 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Tableau de bord</div>
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
                Tableau de bord
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-dark">Vue d'ensemble</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => router.push('/admin/users')}>
                Gérer les utilisateurs
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/chases')}>
                Gérer les chasses
              </Button>
              <Button onClick={() => router.push('/partner-studio/builder')}>
                Créer une chasse
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="border border-white/70 bg-white/90">
                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                <div className="mt-2 text-3xl font-black text-dark">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-500">{stat.detail}</div>
              </Card>
            ))}
          </div>

          <Card className="border border-white/70 bg-white/90 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-dark">Carte interactive</h2>
              <p className="text-sm text-slate-500">
                Visualisez les chasses et les utilisateurs en temps réel
              </p>
            </div>
            <div className="h-96">
              <InteractiveMap
                center={[37.808, -122.417]}
                zoom={13}
                markers={mapMarkers}
                className="h-full"
              />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-white/70 bg-white/90">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-dark">Chasses récentes</h2>
                <Button variant="outline" size="sm" onClick={() => router.push('/chases')}>
                  Voir tout
                </Button>
              </div>
              <div className="space-y-3">
                {chases.slice(0, 5).map((chase) => (
                  <div
                    key={chase.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-dark">{chase.title}</div>
                      <div className="text-sm text-slate-500">
                        {chase.participants} participants
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        chase.difficulty === 'easy'
                          ? 'bg-green-100 text-green-800'
                          : chase.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {chase.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-white/70 bg-white/90">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-dark">Utilisateurs récents</h2>
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
                  Voir tout
                </Button>
              </div>
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {(user.name ?? user.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-dark">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">{user.points} pts</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
