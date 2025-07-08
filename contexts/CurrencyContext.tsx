import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of the context
interface CurrencyContextType {
  currency: string;
  rate: number;
  changeCurrency: (currency: string, rate: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

const DEFAULT_CURRENCY = 'USD';
const DEFAULT_RATE = 1;

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [rate, setRate] = useState<number>(DEFAULT_RATE);

  // On mount, load currency and rate from AsyncStorage
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('selectedCurrency');
        const savedRate = await AsyncStorage.getItem('selectedCurrencyRate');
        if (savedCurrency) setCurrency(savedCurrency);
        if (savedRate) setRate(Number(savedRate));
      } catch (e) {
        // fallback to defaults
      }
    };
    loadCurrency();
  }, []);

  // When currency or rate changes, persist to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('selectedCurrency', currency);
    AsyncStorage.setItem('selectedCurrencyRate', rate.toString());
  }, [currency, rate]);

  const changeCurrency = (newCurrency: string, newRate: number) => {
    setCurrency(newCurrency);
    setRate(newRate);
    // Persistence is handled by useEffect
  };

  return (
    <CurrencyContext.Provider value={{ currency, rate, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}; 