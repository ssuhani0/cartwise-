import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="text-lg font-extrabold">
                <span className="text-primary">{APP_NAME.slice(0, 4)}</span>
                <span className="text-secondary">{APP_NAME.slice(4)}</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your smart kirana shopping assistant. Order groceries from local shops with AI-powered recommendations.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/shops" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nearby Shops</Link></li>
              <li><Link to="/cart" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cart</Link></li>
              <li><Link to="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">Orders</Link></li>
              <li><Link to="/ocr" className="text-sm text-muted-foreground hover:text-primary transition-colors">OCR Scanner</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/shops?category=vegetables" className="text-sm text-muted-foreground hover:text-primary transition-colors">Vegetables</Link></li>
              <li><Link to="/shops?category=fruits" className="text-sm text-muted-foreground hover:text-primary transition-colors">Fruits</Link></li>
              <li><Link to="/shops?category=dairy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dairy & Eggs</Link></li>
              <li><Link to="/shops?category=snacks" className="text-sm text-muted-foreground hover:text-primary transition-colors">Snacks</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Account</Link></li>
              <li><span className="text-sm text-muted-foreground">help@cartwise.app</span></li>
              <li><span className="text-sm text-muted-foreground">+91 1800-123-4567</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for Indian Kirana Stores
          </p>
        </div>
      </div>
    </footer>
  );
}
