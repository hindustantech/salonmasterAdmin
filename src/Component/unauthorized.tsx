import { Shield, Home, ArrowLeft, Lock, AlertTriangle, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const Unauthorized = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Dynamic gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)`
          }}
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-20 animate-pulse`}
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}
          />
        ))}

        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-pink-500/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-purple-400/20 rotate-45 animate-pulse" />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className={`max-w-lg w-full transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          {/* Glowing Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
            
            {/* Main card */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              
              {/* Animated Icon */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-pink-500/50">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* Orbiting icons */}
                  <div className="absolute top-0 left-0 w-24 h-24 animate-spin" style={{ animationDuration: '4s' }}>
                    <Lock className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 text-red-400" />
                    <AlertTriangle className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 text-yellow-400" />
                    <Zap className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Zap className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>

              {/* Error Code with Animation */}
              <div className="text-center mb-6">
                <h1 className="text-8xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 animate-pulse">
                  403
                </h1>
                <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">
                  ACCESS DENIED
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full" />
              </div>

              {/* Description */}
              <div className="text-center mb-8">
                <p className="text-gray-300 text-lg leading-relaxed">
                  🚫 You don't have the required permissions to access this area. 
                  <br />
                  <span className="text-pink-300">Please contact your administrator for assistance.</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleGoBack}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25 flex items-center justify-center gap-3 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Go Back
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button
                  onClick={handleGoHome}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/30 hover:border-white/50 flex items-center justify-center gap-3 group backdrop-blur-sm"
                >
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Return Home
                </button>
              </div>

              {/* Support Info */}
              <div className="text-center mt-8 pt-6 border-t border-white/20">
                <p className="text-gray-400 text-sm">
                  Need immediate help? 
                  <br />
                  <a 
                    href="mailto:support@company.com" 
                    className="text-pink-400 hover:text-pink-300 underline font-medium transition-colors ml-1"
                  >
                    📧 Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Floating Action Hint */}
          <div className={`text-center mt-6 transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
            <p className="text-gray-400 text-sm animate-bounce">
              ✨ Move your mouse around for interactive effects
            </p>
          </div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-transparent rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-tl-full" />
    </div>
  );
};

export default Unauthorized;