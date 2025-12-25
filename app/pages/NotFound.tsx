import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn("404: Route not found:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center space-y-6 p-8">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto shadow-xl">
          <Home className="w-12 h-12 text-white" />
        </div>
        
        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-800">404</h1>
          <p className="text-xl text-slate-600">Page not found</p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="lg">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/browse" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Browse Rooms
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
