'use client'

import useAuthCheck from '@/app/lib/useAuthCheck';
import Wizard from '@/app/ui/dashboard/operaciones/admin/components/gastos/GastoWizard';

const Page = () => {
  useAuthCheck();
  return <Wizard />;
};

export default Page;
