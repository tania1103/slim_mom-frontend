import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import BackendStatus from '../BackendStatus/BackendStatus';

const SharedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BackendStatus />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default SharedLayout;
