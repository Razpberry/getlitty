import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  image?: string; // Optional image for the author
  title?: string; // Optional title/position for the author
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, image, title }) => (
  <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl border border-gray-100">
    <p className="text-lg italic mb-6 text-gray-700">"{quote}"</p>
    <div className="flex items-center">
      {image && (
        <img
          src={image}
          alt={author}
          className="w-12 h-12 rounded-full mr-4 object-cover"
        />
      )}
      <div>
        <p className="font-semibold text-green-600 text-base">{author}</p>
        {title && <p className="text-sm text-gray-500">{title}</p>}
      </div>
    </div>
  </div>
);

export default TestimonialCard;
