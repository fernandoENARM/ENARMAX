import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ChevronRight } from 'lucide-react';

const QuestionBankCard = () => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate('/quiz')}
      className="cursor-pointer flex items-center justify-between p-5 rounded-2xl border bg-white hover:bg-gray-50"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-full bg-orange-50 text-orange-500">
          <FileQuestion size={20} />
        </div>
        <div>
          <p className="font-medium">Banco de Preguntas</p>
          <p className="text-sm text-gray-500">Cuestionario adaptativo</p>
        </div>
      </div>
      <ChevronRight className="text-gray-400" />
    </div>
  );
};

export default QuestionBankCard;
