import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent border-t border-border mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} FESTIVAL. All rights reserved.</p>
        <p className="mt-1">A world-class platform for festival tickets.</p>
      </div>
    </footer>
  );
};

export default Footer;