'use client'; 

import { FC, useState, useEffect } from 'react';
import { title, subtitle } from "@/components/primitives";
import Vapes from '@/components/vapes';
import { Vape } from '@/types';
import seedData from '@/config/seed_data.json';
import UserSparkLineChart from '@/components/sparkline';

const DashboardPage: FC = () => {
  const vapes: Vape[] = seedData.vapes;

  return (
    <div>
      <div>
        Dashboard
      </div>
    </div>
  );
};

export default DashboardPage;
