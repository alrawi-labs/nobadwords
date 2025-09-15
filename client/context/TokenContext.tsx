// TokenContext.tsx
import { createContext, useContext, useState } from "react";

type TokenContextType = {
  tokenCount: number;
  setTokenCount: (count: number) => void;
};

const TokenContext = createContext<TokenContextType>({
  tokenCount: 0,
  setTokenCount: () => {},
});

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokenCount, setTokenCount] = useState<number>(0);

  return (
    <TokenContext.Provider value={{ tokenCount, setTokenCount }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);
