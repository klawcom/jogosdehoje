import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/estatisticas')({
  beforeLoad: () => {
    throw redirect({
      to: '/brasileirao',
      search: { tab: 'estatisticas' },
    });
  },
});
