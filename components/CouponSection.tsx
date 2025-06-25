import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CouponSectionProps = {
  originalTotal: number;
  onUpdateCart?: (updatedCart: any) => void; // optional callback to update parent cart state
};

const CouponSection: React.FC<CouponSectionProps> = ({
  originalTotal,
  onUpdateCart,
}) => {
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      const payload = {
        coupon_code: coupon.trim(), // trim to avoid issues
      };

      console.log('Applying coupon with payload:', JSON.stringify(payload));

      const response = await fetch(
        'https://api.sareh-nomow.xyz/api/coupons/apply',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to apply coupon');
        setLoading(false);
        return;
      }

      if (result?.data?.grand_total) {
        setDiscountedTotal(result.data.grand_total);
        if (onUpdateCart) onUpdateCart(result.data);
      }
    } catch (error: any) {
      setError(error.message || 'Error applying coupon');
    } finally {
      setLoading(false);
    }

    console.log('Coupon code applied:', coupon);
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={coupon}
        onChangeText={setCoupon}
        placeholder="Enter coupon code"
        style={styles.input}
      />
      <Button
        title={loading ? 'Applying...' : 'Apply Coupon'}
        onPress={handleApplyCoupon}
        disabled={loading || coupon.trim() === ''}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {discountedTotal !== null && (
        <View style={styles.priceContainer}>
          <Text style={styles.oldPrice}>
            Original: ${originalTotal.toFixed(2)}
          </Text>
          <Text style={styles.newPrice}>
            Price after discount: ${discountedTotal.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CouponSection;

const styles = StyleSheet.create({
  container: {marginTop: 16},
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  error: {color: 'red', marginTop: 4},
  priceContainer: {marginTop: 10},
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 16,
  },
  newPrice: {
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
