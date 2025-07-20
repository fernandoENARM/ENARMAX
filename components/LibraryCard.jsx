import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

const LibraryCard = () => (
  <div className="flex items-center justify-between p-5 rounded-2xl border">
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-full bg-emerald-50 text-emerald-500">
        <BookOpen size={20} />
      </div>
      <div>
        <p className="font-medium">Biblioteca Médica</p>
        <p className="text-sm text-gray-500">Resúmenes clínicos ENARM</p>
      </div>
    </div>
    <ChevronRight className="text-gray-400" />
  </div>
);

export default LibraryCard;
