import React from 'react';
import { UserCircleIcon } from '@heroicons/react/solid';

const DashboardLayout = ({ nombreUser, children }) => (
  <main className="min-h-screen bg-gray-50">
    <header className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] py-6 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">Hola, {nombreUser}</h1>
        <p className="text-sm text-blue-100">Bienvenido de nuevo</p>
      </div>
      <UserCircleIcon className="h-12 w-12 text-blue-100" />
    </header>
    <div className="grid md:grid-cols-3 gap-6 p-6">
      {children}
    </div>
  </main>
);

export default DashboardLayout;
