import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveOfflineProduct = async (productId: string, data: any) => {
  try {
    await AsyncStorage.setItem(`product_${productId}`, JSON.stringify(data));
  } catch (err) {
    console.error('Saving product offline failed:', err);
  }
};

export const getOfflineProducts = async (): Promise<any[]> => {
  const keys = await AsyncStorage.getAllKeys();
  const productKeys = keys.filter(k => k.startsWith('product_'));
  const stores = await AsyncStorage.multiGet(productKeys);
  return stores.map(([_key, value]) => JSON.parse(value || '{}'));
};

export const removeOfflineProduct = async (productId: string) => {
  await AsyncStorage.removeItem(`product_${productId}`);
};
