'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAsync } from '@/hooks/useAsync';
import { chaseService } from '@/lib/chase-service';
import { Chase } from '@/types';

const analyticsTiles = [
  { label: 'Démarrages', value: '1 284', detail: '+18% cette semaine' },
  { label: 'Complétion', value: '71%', detail: 'Temps moyen : 41 min' },
  { label: 'Abandon', value: '12%', detail: 'Principalement à l’étape 3' },
  { label: 'Usage mobile', value: '94%', detail: 'Vue joueur optimisée' },
];

const statusFilters: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Toutes' },
  { id: 'live', label: 'En ligne' },
  { id: 'test', label: 'Test' },
  { id: 'draft', label: 'Brouillon' },
];

/** État réel d'une chasse : launchMode si présent, sinon dérivé du status. */
const chaseState = (chase: Chase): string => {
  if (chase.status === 'archived') return 'archived';
  if (chase.launchMode) return chase.launchMode;
  return chase.status === 'active' ? 'live' : 'draft';
};

export default function PartnerStudioDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'partner') {
      router.replace('/chases');
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  const { status: chaseStatus, data: chases } = useAsync(
    () => (user ? chaseService.getUserChases(user.id) : Promise.resolve([])),
    !!user
  ) as { status: string; data: Chase[] | null };

  const filteredChases = useMemo(() => {
    const list = chases ?? [];
    const query = search.trim().toLowerCase();

    return list.filter((chase) => {
      const matchesStatus = statusFilter === 'all' || chaseState(chase) === statusFilter;
      const matchesSearch = !query || `${chase.title} ${chase.description}`.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [chases, search, statusFilter]);

  if (isLoading || !isAuthenticated || chaseStatus === 'pending') {
    return <LoadingSpinner fullScreen />;
  }

  const partnerName = user?.name || user?.username || 'Partenaire';

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-12">
        {/* En-tête */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-dark bg-white p-6 shadow-arcade md:p-8"
        >
          <div className="space-y-2">
            <div className="inline-flex rounded-full border-2 border-dark bg-card-yellow px-3 py-1 text-xs font-bold text-dark">
              Partner Studio
            </div>
            <h1 className="text-3xl font-black tracking-tight text-dark md:text-4xl">Bonjour, {partnerName}</h1>
            <p className="font-medium text-gray-600">Pilotez vos chasses, suivez leurs performances et créez-en de nouvelles.</p>
          </div>
          <Button size="lg" onClick={() => router.push('/partner-studio/builder')}>
            + Nouvelle chasse
          </Button>
        </motion.section>

        {/* KPI globaux */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analyticsTiles.map((tile, index) => (
            <Card
              key={tile.label}
              className={`shadow-arcade ${['!bg-card-orange', '!bg-card-blue', '!bg-card-yellow', '!bg-card-green'][index % 4]}`}
            >
              <div className="text-sm font-bold text-dark">{tile.label}</div>
              <div className="mt-2 text-3xl font-black text-dark">{tile.value}</div>
              <div className="mt-1 text-sm font-medium text-gray-600">{tile.detail}</div>
            </Card>
          ))}
        </section>

        {/* Mes chasses */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-dark">Mes chasses</h2>
              <p className="text-sm font-medium text-gray-600">{filteredChases.length} chasse(s) affichée(s).</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="text"
                placeholder="Rechercher une chasse…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-64"
              />
              <div className="flex rounded-xl border-2 border-dark bg-white p-1 shadow-arcade-sm">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                      statusFilter === filter.id ? 'bg-dark text-warning' : 'text-gray-600 hover:bg-cream'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredChases.length === 0 ? (
            <Card className="py-12 text-center shadow-arcade">
              <p className="text-lg font-medium text-gray-600">Aucune chasse ne correspond à ces critères.</p>
              <div className="mt-4">
                <Button onClick={() => router.push('/partner-studio/builder')}>Créer ma première chasse</Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredChases.map((chase) => (
                <Card key={chase.id} className="flex flex-col !p-0 overflow-hidden shadow-arcade">
                  {chase.image && (
                    <Image
                      src={chase.image}
                      alt={chase.title}
                      width={640}
                      height={280}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-dark">{chase.title}</h3>
                      <StatusBadge status={chaseState(chase)} />
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-500">{chase.description}</p>
                    <div className="mt-auto flex items-center justify-between pt-2 text-xs text-slate-500">
                      <span>{chase.steps?.length ?? 0} étapes</span>
                      <span>{chase.participants} joueurs · {chase.rating}/5 ⭐</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/chases/${chase.id}`)}
                      >
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push('/partner-studio/builder')}
                      >
                        Éditer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
