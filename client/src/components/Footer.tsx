import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-4 px-8 border-t bg-card text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-muted-foreground shrink-0 z-40 w-full">
      <div>
        Copyright © {new Date().getFullYear()} | SQLGPT | Developed by <span className="font-semibold text-foreground">SHANKAR S</span>.
      </div>
      <Link 
        to="/about"
        className="flex items-center gap-1 hover:text-primary transition-colors px-2.5 py-1 rounded bg-secondary/30 hover:bg-secondary/60 font-medium"
      >
        <Info size={14} /> About Developer & Guide
      </Link>
    </footer>
  );
};

export default Footer;
