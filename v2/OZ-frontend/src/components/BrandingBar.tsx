import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export function BrandingBar() {
  const { restaurant, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isMissingInfo = isAuthenticated && restaurant && (!restaurant.logo || !restaurant.phone);

  return (
    <div 
      className="fixed top-0 left-0 w-full h-[40px] z-9999 pointer-events-none flex items-center px-4" 
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div 
        className="flex items-center gap-2 pointer-events-auto select-none cursor-pointer group"
        onClick={() => navigate('/settings')}
      >
        {/* OrderZap Logo */}
        <img 
          src="/OZ-logos/orderzap-bg-tras-land.svg" 
          className="h-5 w-auto" 
          alt="OrderZap" 
        />
        
        {isAuthenticated && restaurant && (
          <>
            {/* The "X" Collab Separator */}
            <span className="text-[10px] font-bold text-white/30 mx-1 group-hover:text-primary transition-colors">X</span>
            
            {/* Restaurant Logo & Name */}
            <div className="flex items-center gap-2 bg-white/5 pr-3 pl-1.5 py-1 rounded-full border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-all">
              {restaurant.logo ? (
                <img 
                  src={restaurant.logo} 
                  className="h-4 w-4 rounded-full object-cover" 
                  alt={restaurant.name} 
                />
              ) : (
                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <span className="text-[11px] font-medium text-white/70 group-hover:text-white">
                {restaurant.name}
              </span>
              {isMissingInfo && (
                <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-warning/20 border border-warning/30">
                   <AlertCircle className="w-2.5 h-2.5 text-warning" />
                   <span className="text-[8px] font-bold text-warning uppercase">Missing {!restaurant.logo ? 'Logo' : ''} {!restaurant.logo && !restaurant.phone ? '&' : ''} {!restaurant.phone ? 'Number' : ''}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
