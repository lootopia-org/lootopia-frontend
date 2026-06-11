import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Hunt } from '@/types';
import { cn, difficultyBg, formatDuration } from '@/lib/utils';

interface HuntCardProps {
  hunt: Hunt;
  showPartner?: boolean;
}

export function HuntCard({ hunt, showPartner = false }: HuntCardProps) {
  return (
    <Link href={`/hunts/${hunt.id}`}>
      <Card className="group overflow-hidden transition-all hover:border-gold/30 hover:glow-gold h-full">
        <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
          {hunt.image ? (
            <Image
              src={hunt.image}
              alt={hunt.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gold/10 to-teal/10">
              <MapPin className="h-12 w-12 text-gold/40" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={cn('capitalize', difficultyBg(hunt.difficulty))}>
              {hunt.difficulty}
            </Badge>
            {hunt.status === 'draft' && <Badge variant="draft">Draft</Badge>}
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-display text-lg font-semibold group-hover:text-gold transition-colors line-clamp-1">
            {hunt.title}
          </h3>
          <p className="mt-2 text-sm text-white/50 line-clamp-2">{hunt.description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(hunt.estimatedDuration)}
            </span>
            <span>{hunt.steps?.length ?? 0} steps</span>
          </div>
          {showPartner && (
            <p className="mt-2 text-xs text-teal/70">Partner: {hunt.partnerId.slice(0, 8)}…</p>
          )}
          <div className="mt-3 flex items-center text-sm text-gold opacity-0 group-hover:opacity-100 transition-opacity">
            View details <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
