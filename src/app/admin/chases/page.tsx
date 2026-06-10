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
    ? 'bg-card-green'
    : difficulty === 'medium'
    ? 'bg-card-yellow'
    : 'bg-card-orange';

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
      <div className="min-h-screen bg-cream px-4 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <Card className="w-full space-y-4 text-center">
            <div className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Gestion des chasses</div>
            <h1 className="text-3xl font-black text-dark">Chargement...</h1>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-cream">
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-12">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full border-2 border-dark bg-card-orange px-3 py-1 text-xs font-bold text-dark">
                Administration
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-dark">Gestion des chasses</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push('/partner-studio/builder')}>Nouvelle chasse</Button>
              <Button variant="outline" onClick={() => router.push('/admin')}>Retour</Button>
            </div>
          </div>

          <Card className="shadow-arcade">
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

          <Card className="overflow-hidden shadow-arcade !p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-2 border-dark bg-card-yellow">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-dark">Chasse</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-dark">Statut</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-dark">Difficulté</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-dark">Participants</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
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
                        <span className={`inline-flex rounded-full border-2 border-dark px-3 py-1 text-xs font-bold text-dark ${difficultyClass(chase.difficulty)}`}>
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
