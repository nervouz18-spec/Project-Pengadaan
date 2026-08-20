import { Item, GlobalSettings, CalculationHistory } from '../types';

export const initialGlobalSettings: GlobalSettings = {
  defaultCashback: 10,
  defaultCommission: 3,
};

// Initial items starts empty according to user request
export const initialItems: Item[] = [];

export const initialHistories: CalculationHistory[] = [];
