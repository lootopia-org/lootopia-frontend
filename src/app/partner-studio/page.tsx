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

const statusFilters: Array<{ id: 'all' | Chase['status']; label: string }> = [
  { id: 'all', label: 'Toutes' },
  { id: 'active', label: 'En ligne' },
  { id: 'draft', label: 'Brouillon' },
  { id: 'archived', label: 'Archivées' },
];

export default function PartnerStudioDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Chase['status']>('all');

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
      const matchesStatus = statusFilter === 'all' || chase.status === statusFilter;
      const matchesSearch = !query || `${chase.title} ${chase.description}`.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [chases, search, statusFilter]);

  if (isLoading || !isAuthenticated || chaseStatus === 'pending') {
    return <LoadingSpinner fullScreen />;
  }

  const partnerName = user?.name || user?.username || 'Partenaire';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4fa_100%)]">
      <div className="absolute inset-x-0 top-0 h-60 bg-gradient opacity-90" />
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-12">
        {/* En-tête */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-white/80 p-6 shadow-xl ring-1 ring-white/60 backdrop-blur md:p-8"
        >
          <div className="space-y-2">
            <div className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              Partner Studio
            </div>
            <h1 className="text-3xl font-black tracking-tight text-dark md:text-4xl">Bonjour, {partnerName}</h1>
            <p className="text-slate-600">Pilotez vos chasses, suivez leurs performances et créez-en de nouvelles.</p>
          </div>
          <Button size="lg" onClick={() => router.push('/partner-studio/builder')}>
            + Nouvelle chasse
          </Button>
        </motion.section>

        {/* KPI globaux */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analyticsTiles.map((tile) => (
            <Card key={tile.label} className="border border-white/70 bg-white/90">
              <div className="text-sm font-medium text-slate-500">{tile.label}</div>
              <div className="mt-2 text-3xl font-black text-dark">{tile.value}</div>
              <div className="mt-1 text-sm text-slate-500">{tile.detail}</div>
            </Card>
          ))}
        </section>

        {/* Mes chasses */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-dark">Mes chasses</h2>
              <p className="text-sm text-slate-500">{filteredChases.length} chasse(s) affichée(s).</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="text"
                placeholder="Rechercher une chasse…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-64"
              />
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      statusFilter === filter.id ? 'bg-secondary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredChases.length === 0 ? (
            <Card className="border border-white/70 bg-white/90 py-12 text-center">
              <p className="text-lg text-slate-600">Aucune chasse ne correspond à ces critères.</p>
              <div className="mt-4">
                <Button onClick={() => router.push('/partner-studio/builder')}>Créer ma première chasse</Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredChases.map((chase) => (
                <Card key={chase.id} className="flex flex-col border border-white/70 bg-white/90 !p-0 overflow-hidden">
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
                      <StatusBadge status={chase.status} />
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
