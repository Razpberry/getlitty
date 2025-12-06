import React from 'react';

const Step = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-brand-600 text-white">
      {number}
    </div>
    <div>
      <h4 className="text-xl font-bold mb-1 text-gray-900">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  </div>
);

export default Step;
