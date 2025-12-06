import React from 'react';

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-xl border transition-all hover:-translate-y-1 bg-white border-gray-100 shadow-xl shadow-gray-200/50">
    <div className="mb-6 p-3 rounded-lg inline-block bg-brand-100 text-brand-600">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

export default FeatureCard;
