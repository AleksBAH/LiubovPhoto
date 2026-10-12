export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: any = { status: 'completed' };
    if (from && to) {
      where.completedDate = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    const projects = await prisma.project.findMany({ where });

    const totalEarned = projects.reduce((s: number, p: any) => s + (p?.price ?? 0) + (p?.extraPrice ?? 0), 0);
    const totalProjects = projects?.length ?? 0;
    const totalPhotos = projects.reduce((s: number, p: any) => s + (p?.photosCount ?? 0) + (p?.extraPhotos ?? 0), 0);

    let avgProcessingDays = 0;
    const withDates = projects.filter((p: any) => p?.paidAt && p?.completedDate);
    if (withDates?.length > 0) {
      const totalDays = withDates.reduce((s: number, p: any) => {
        const paid = new Date(p.paidAt!).getTime();
        const done = new Date(p.completedDate!).getTime();
        return s + (done - paid) / (1000 * 60 * 60 * 24);
      }, 0);
      avgProcessingDays = Math.round(totalDays / withDates.length);
    }

    // By source
    const bySource: Record<string, { count: number; revenue: number }> = {};
    projects.forEach((p: any) => {
      const src = p?.sourceTag || 'Unknown';
      if (!bySource[src]) bySource[src] = { count: 0, revenue: 0 };
      bySource[src].count++;
      bySource[src].revenue += (p?.price ?? 0) + (p?.extraPrice ?? 0);
    });

    // By category
    const byCategory: Record<string, { count: number; revenue: number }> = {};
    projects.forEach((p: any) => {
      const cat = p?.category || 'Other';
      if (!byCategory[cat]) byCategory[cat] = { count: 0, revenue: 0 };
      byCategory[cat].count++;
      byCategory[cat].revenue += (p?.price ?? 0) + (p?.extraPrice ?? 0);
    });

    return NextResponse.json({
      totalEarned,
      totalProjects,
      totalPhotos,
      avgProcessingDays,
      bySource,
      byCategory,
      projects,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 500 });
  }
}
