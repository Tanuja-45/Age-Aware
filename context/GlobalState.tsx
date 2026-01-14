import React, { createContext, useContext, useState } from "react";

type GlobalContextType = {
  age: number | null;
  setAge: (age: number | null) => void;
  screenTime: number;
  setScreenTime: (time: number) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [age, setAge] = useState<number | null>(null);
  const [screenTime, setScreenTime] = useState<number>(0);

  return (
    <GlobalContext.Provider value={{ age, setAge, screenTime, setScreenTime }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalState must be used within GlobalProvider");
  }
  return context;
};
