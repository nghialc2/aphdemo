import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Model } from "@/types";
import { useSession } from "./SessionContext";

interface CompareContextProps {
  isCompareMode: boolean;
  toggleCompareMode: () => void;
  leftModelId: string;
  rightModelId: string;
  setLeftModel: (modelId: string) => void;
  setRightModel: (modelId: string) => void;
}

const CompareContext = createContext<CompareContextProps | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const { availableModels, selectedModel } = useSession();
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [leftModelId, setLeftModelId] = useState(selectedModel?.id || (availableModels.length > 0 ? availableModels[0].id : ''));
  // Set the right model to the second model in the list by default, or the first if there's only one
  const [rightModelId, setRightModelId] = useState(
    availableModels.length > 1 ? availableModels[1].id : (availableModels.length > 0 ? availableModels[0].id : '')
  );
  
  // Check URL hash on startup to determine if we're in comparison mode
  useEffect(() => {
    const isInComparisonMode = window.location.hash === '#comparison';
    setIsCompareMode(isInComparisonMode);
    
    // Listen for hash changes
    const handleHashChange = () => {
      setIsCompareMode(window.location.hash === '#comparison');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const toggleCompareMode = () => {
    const newMode = !isCompareMode;
    setIsCompareMode(newMode);
    
    // Update URL hash to reflect comparison mode
    if (newMode) {
      window.location.hash = 'comparison';
    } else {
      window.location.hash = '';
    }
  };

  const setLeftModel = (modelId: string) => {
    setLeftModelId(modelId);
  };

  const setRightModel = (modelId: string) => {
    setRightModelId(modelId);
  };

  return (
    <CompareContext.Provider
      value={{
        isCompareMode,
        toggleCompareMode,
        leftModelId,
        rightModelId,
        setLeftModel,
        setRightModel,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
