import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAvailableCurrencies } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import colors from '../utils/colors';

const CurrencyScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { changeCurrency } = useCurrency();
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

    const currencyFlags: Record<string, string> = {
        USD: '🇺🇸',
        EUR: '🇪🇺',
        GBP: '🇬🇧',
        JOD: '🇯🇴',
        SAR: '🇸🇦',
        KWD: '🇰🇼',
        AED: '🇦🇪',
        QAR: '🇶🇦',
        BHD: '🇧🇭',
        OMR: '🇴🇲',
    };

    const currencyNames: Record<string, string> = {
        USD: 'US Dollar',
        EUR: 'Euro',
        GBP: 'British Pound',
        JOD: 'Jordanian Dinar',
        SAR: 'Saudi Riyal',
        KWD: 'Kuwaiti Dinar',
        AED: 'UAE Dirham',
        QAR: 'Qatari Riyal',
        BHD: 'Bahraini Dinar',
        OMR: 'Omani Rial',
    };

    const currencyRates: Record<string, number> = {
        USD: 1,
        EUR: 0.91,
        GBP: 0.77,
        JOD: 0.71,
        SAR: 3.75,
        KWD: 0.31,
        AED: 3.67,
        QAR: 3.64,
        BHD: 0.38,
        OMR: 0.38,
    };

    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                const res = await getAvailableCurrencies();
                if (res?.length > 0) {
                    setCurrencies(res);
                    const saved = await AsyncStorage.getItem('selectedCurrency');
                    if (saved && res.includes(saved)) {
                        setSelectedCurrency(saved);
                    } else {
                        setSelectedCurrency(res[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading currencies:', error);
                // Fallback to default currencies if API fails
                const defaultCurrencies = ['USD', 'EUR', 'GBP', 'JOD', 'SAR', 'KWD'];
                setCurrencies(defaultCurrencies);
                setSelectedCurrency('USD');
            }
        };

        loadCurrencies();
    }, []);

    const handleCurrencySelect = async (currency: string) => {
        setSelectedCurrency(currency);
        await AsyncStorage.setItem('selectedCurrency', currency);
        changeCurrency(currency, currencyRates[currency] || 1);
        navigation.goBack();
    };

    const renderCurrencyItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.currencyItem,
                selectedCurrency === item && styles.selectedCurrencyItem,
            ]}
            onPress={() => handleCurrencySelect(item)}
        >
            <View style={styles.currencyInfo}>
                <Text style={styles.currencyFlag}>
                    {currencyFlags[item] || '🏳️'}
                </Text>
                <View style={styles.currencyDetails}>
                    <Text style={styles.currencyCode}>{item}</Text>
                    <Text style={styles.currencyName}>
                        {currencyNames[item] || 'Unknown Currency'}
                    </Text>
                </View>
            </View>
            {selectedCurrency === item && (
                <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header
                showImage={false}
                title={t('currency.title') || 'Currency'}
                rightIcons={[]}
            />
            <FlatList
                data={currencies}
                keyExtractor={(item) => item}
                renderItem={renderCurrencyItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    listContainer: {
        paddingVertical: 16,
    },
    currencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.card.background,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        elevation: 2,
        shadowColor: colors.shadow.primary,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    selectedCurrencyItem: {
        backgroundColor: colors.primary.light,
        borderWidth: 2,
        borderColor: colors.primary.main,
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    currencyFlag: {
        fontSize: 24,
        marginRight: 16,
    },
    currencyDetails: {
        flex: 1,
    },
    currencyCode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 2,
    },
    currencyName: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: colors.text.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CurrencyScreen; 