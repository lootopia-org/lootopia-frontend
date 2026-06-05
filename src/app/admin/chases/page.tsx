'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/lib/notification-store';
import { chaseService } from '@/lib/chase-service';
import { Chase } from '@/types';

const difficultyClass = (difficulty: Chase['difficulty']) =>
  difficulty === 'easy'
    ? 'bg-green-100 text-green-800'
    : difficulty === 'medium'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800';

/** État réel d'une chasse : launchMode si présent, sinon dérivé du status. */
const chaseState = (chase: Chase): string => {
  if (chase.status === 'archived') return 'archived';
  if (chase.launchMode) return chase.launchMode;
  return chase.status === 'active' ? 'live' : 'draft';
};

export default function AdminChaseManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const [chases, setChases] = useState<Chase[]>([]);
  const [search, setSearch] = useState('');
  const [isLoadingChases, setIsLoadingChases] = useState(true);

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

    loadChases();
  }, [isAuthenticated, isLoading, router, user?.role]);

  const loadChases = async () => {
    try {
      const result = await chaseService.getChases(1, 100);
      setChases(result.data);
    } catch (error) {
      console.error('Error loading chases:', error);
      addNotification({ type: 'error', message: 'Erreur lors du chargement des chasses' });
    } finally {
      setIsLoadingChases(false);
    }
  };

  const updateStatus = async (chase: Chase, updates: Partial<Chase>, message: string) => {
    try {
      await chaseService.updateChase(chase.id, updates);
      addNotification({ type: 'success', message });
      loadChases();
    } catch (error) {
      console.error('Error updating chase:', error);
      addNotification({ type: 'error', message: 'Erreur lors de la mise à jour de la chasse' });
    }
  };

  const handleDelete = async (chase: Chase) => {
    if (!confirm(`Supprimer définitivement « ${chase.title} » ?`)) {
      return;
    }

    try {
      await chaseService.deleteChase(chase.id);
      addNotification({ type: 'success', message: 'Chasse supprimée.' });
      loadChases();
    } catch (error) {
      console.error('Error deleting chase:', error);
      addNotification({ type: 'error', message: 'Erreur lors de la suppression' });
    }
  };

  const filteredChases = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chases;
    return chases.filter((chase) =>
      `${chase.title} ${chase.description} ${chase.partner?.name ?? ''}`.toLowerCase().includes(query)
    );
  }, [chases, search]);

  if (isLoading || isLoadingChases) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)] px-4 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <Card className="w-full space-y-4 text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Gestion des chasses</div>
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
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                Administration
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-dark">Gestion des chasses</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push('/partner-studio/builder')}>Nouvelle chasse</Button>
              <Button variant="outline" onClick={() => router.push('/admin')}>Retour</Button>
            </div>
          </div>

          <Card className="border border-white/70 bg-white/90">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md flex-1">
                <Input
                  placeholder="Rechercher une chasse..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button onClick={loadChases}>Rafraîchir</Button>
            </div>
          </Card>

          <Card className="overflow-hidden border border-white/70 bg-white/90">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Chasse</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Difficulté</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Participants</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredChases.map((chase) => (
                    <tr key={chase.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-dark">{chase.title}</div>
                        <div className="text-sm text-slate-500">{chase.partner?.name ?? '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={chaseState(chase)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${difficultyClass(chase.difficulty)}`}>
                          {chase.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{chase.participants}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/chases/${chase.id}`)}>
                            Voir
                          </Button>
                          {chase.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(chase, { status: 'draft', launchMode: 'draft' }, 'Chasse mise hors-ligne.')}
                            >
                              Mettre hors-ligne
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(chase, { status: 'active', launchMode: 'live' }, 'Chasse publiée.')}
                            >
                              Publier
                            </Button>
                          )}
                          {chase.status === 'archived' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(chase, { status: 'draft', launchMode: 'draft' }, 'Chasse restaurée.')}
                            >
                              Restaurer
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(chase, { status: 'archived' }, 'Chasse archivée.')}
                            >
                              Archiver
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(chase)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredChases.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-slate-500">Aucune chasse trouvée</p>
              </div>
            )}
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
