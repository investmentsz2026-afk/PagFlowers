import React from 'react';
import TrackClient from './TrackClient';

export const metadata = {
  title: 'Seguimiento de Pedido | RossyFlowers',
  description: 'Rastrea en tiempo real el estado de tu arreglo floral o caja de regalo en RossyFlowers.',
};

export default function TrackPage() {
  return <TrackClient />;
}
