import { CookingPot } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4">
          <CookingPot className="h-8 w-8 text-primary mx-auto mb-3 brightness-150" strokeWidth={1.5} />
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce brightness-150"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce brightness-150" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce brightness-150" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
