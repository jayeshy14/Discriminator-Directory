import React from 'react';

interface ExplanationCardProps {
  title: string;
  description: string;
  hint?: string;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({ title, description, hint }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm mb-2">
        {description}
      </p>
      {hint && (
        <p className="text-gray-400 text-xs">
          {hint}
        </p>
      )}
    </div>
  );
};

export default ExplanationCard;
