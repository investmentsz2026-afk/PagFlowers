import DeliveryClient from './DeliveryClient';

export const metadata = {
  title: 'Zonas de Envío | CPanel',
};

export default function DeliveryPage() {
  // Authentication is handled by the parent layout (src/app/admin/layout.tsx)
  return <DeliveryClient />;
}
