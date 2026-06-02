'use client';

import React, { useEffect, useState } from 'react';
import { ChaseCard } from '@/components/ChaseCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Input } from '@/components/Input';
import { useAsync } from '@/hooks/useAsync';
import { chaseService } from '@/lib/chase-service';
import { useDebounce } from '@/hooks/useDebounce';
import { useI18n } from '@/hooks/useI18n';
import { Chase } from '@/types';

export default function ChaseListPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [chases, setChases] = useState<Chase[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { status: loadStatus } = useAsync(
    () => chaseService.getChases(1, 20),
    true,
    (data) => setChases(data.data)
  );

  useEffect(() => {
    if (debouncedSearch.trim()) {
      const search = async () => {
        try {
          const results = await chaseService.searchChases(debouncedSearch);
          setChases(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      };
      search();
    }
  }, [debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-dark mb-4">{t('chases.title')}</h1>
          <p className="text-gray-600 text-lg">{t('chases.subtitle')}</p>
        </div>

        <Input
          type="text"
          placeholder={t('chases.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-2xl"
        />

        {loadStatus === 'pending' ? (
          <LoadingSpinner />
        ) : chases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{t('chases.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chases.map((chase) => (
              <ChaseCard key={chase.id} chase={chase} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
