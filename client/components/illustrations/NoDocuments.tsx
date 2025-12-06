import React from 'react';

const NoDocuments: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M448 32H64C46.33 32 32 46.33 32 64v384c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zm-48 32v128H112V64h288zm-32 320H96v-32h272v32zm0-80H96v-32h272v32zm0-80H96v-32h272v32z" fill="#10B981"/>
  </svg>
);

export default NoDocuments;
