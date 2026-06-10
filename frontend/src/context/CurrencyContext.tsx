"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type CurrencyType = "USD" | "KHR";

interface CurrencyContextProps {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  formatPrice: (priceInUsd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyType>("USD");

  const setCurrency = (curr: CurrencyType) => {
    setCurrencyState(curr);
  };

  const formatPrice = (priceInUsd: number) => {
    if (currency === "USD") {
      return `$${priceInUsd.toFixed(2)}`;
    } else {
      const khrPrice = Math.round(priceInUsd * 4100);
      return `${khrPrice.toLocaleString()} ៛`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
