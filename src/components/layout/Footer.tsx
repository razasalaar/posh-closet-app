import { Link } from 'react-router-dom';
import logoFull from '@/assets/logo-full.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <img src={logoFull} alt="Mansa Mussa" className="h-28 w-auto mb-4" />
            <p className="text-sm text-primary-foreground/70 font-body leading-relaxed">
              Premium Pakistani fashion for the modern individual. Crafted with care, designed with passion.
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase font-body font-semibold mb-4">Shop</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/collections/men" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-body">Men</Link>
              <Link to="/collections/women" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-body">Women</Link>
              <Link to="/collections" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-body">All Collections</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase font-body font-semibold mb-4">Help</h4>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-primary-foreground/70 font-body">Contact Us</span>
              <span className="text-sm text-primary-foreground/70 font-body">Shipping Policy</span>
              <span className="text-sm text-primary-foreground/70 font-body">Returns & Exchange</span>
            </nav>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase font-body font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70 font-body">
              <span>support@luxe.pk</span>
              <span>+92 300 1234567</span>
              <span>Lahore, Pakistan</span>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-xs text-primary-foreground/50 font-body tracking-wider">
            © 2026 MANSA MUSSA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
