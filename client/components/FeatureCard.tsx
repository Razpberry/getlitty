import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center text-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-green-500/50">
    <div className="text-5xl mb-6 text-green-600">{icon}</div>
    <h3 className="text-2xl font-semibold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-700 text-base">{description}</p>
  </div>
);

export default FeatureCard;