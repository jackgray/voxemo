'use client'; 

import { FC, useState, useEffect } from 'react';
import { title, subtitle } from "@/components/primitives";
import { Record } from "@/components/record"

const DashboardPage: FC = () => {

  return (
    <div>
      <div>
        Dashboard
      </div>
      <Record />
    </div>
  );
};

export default DashboardPage;
