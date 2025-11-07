import React from 'react';

export const APP_TITLE = "CBT MIN SINGKAWANG";

export const KemenagLogo: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Kementerian_Agama_new_logo.png/535px-Kementerian_Agama_new_logo.png" 
    alt="Logo Kementerian Agama RI"
    className={className}
  />
);