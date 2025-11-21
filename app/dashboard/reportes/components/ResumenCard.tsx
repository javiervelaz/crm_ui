// app/dashboard/components/ResumenCard.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ResumenCardProps {
  title: string;
  href: string;
  data: any[];
  color?: string;
  className?: string;
}

export default function ResumenCard({
  title,
  href,
  data,
  color = '#3b82f6', // azul por defecto
  className,
}: ResumenCardProps) {
  return (
    <Link href={href} className={cn('block', className)}>
      <Card className="hover:shadow-xl transition-shadow rounded-2xl">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={color} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
