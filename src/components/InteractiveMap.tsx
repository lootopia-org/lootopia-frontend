'use client';

import dynamic from 'next/dynamic';

/**
 * react-leaflet et leaflet accèdent à `window` dès l'import (au niveau module).
 * Lors du prérendu statique de Next (SSG), ces pages sont évaluées côté serveur
 * où `window` n'existe pas -> "ReferenceError: window is not defined".
 *
 * On charge donc l'implémentation uniquement côté client (`ssr: false`). Les
 * pages continuent d'importer `{ InteractiveMap }` sans changement.
 */
export const InteractiveMap = dynamic(
  () => import('./InteractiveMapImpl').then((m) => m.InteractiveMap),
  { ssr: false }
);
