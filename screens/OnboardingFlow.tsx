import React, {useRef, useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import {useTranslation} from 'react-i18next';

const {width, height} = Dimensions.get('window');
const ONBOARDING_SCREENS = [
  {
    // Suggestion: upload a shopping bags or happy shopper image as 'onboarding1.png'
    image: require('../assets/webshop.jpg'),
    title1: 'Welcome to Your One-Stop Shop',
    title2: '',
    desc1: 'Discover everything you need, all in one place.',
    desc2: '',
  },
  {
    // Suggestion: upload a groceries/electronics/fashion collage as 'onboarding2.png'
    image: require('../assets/OnBoarding2.png'),
    title1: 'Endless Variety, Best Prices',
    title2: '',
    desc1: 'From groceries to gadgets, fashion to furniture—find it all here.',
    desc2: '',
  },
  {
    // Suggestion: upload a delivery or happy customer image as 'onboarding3.png'
    image: require('../assets/OnBoarding3.png'),
    title1: 'Fast Delivery, Easy Shopping',
    title2: '',
    desc1: 'Shop from home and get your order delivered to your door.',
    desc2: '',
  },
];

const OnboardingFlow: React.FC = ({navigation}: any) => {
  const {t} = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (!autoScroll) return;
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev === ONBOARDING_SCREENS.length - 1) {
          setAutoScroll(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [autoScroll]);

  // Pause auto-scroll on user interaction, resume after 5s
  const handleUserInteraction = () => {
    setAutoScroll(false);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setTimeout(() => setAutoScroll(true), 5000);
  };

  const handleNext = () => {
    if (currentIndex === ONBOARDING_SCREENS.length - 1) {
      navigation.navigate('CreateAcount');
    } else {
      setCurrentIndex(currentIndex + 1);
      handleUserInteraction();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      handleUserInteraction();
    }
  };

  const screen = ONBOARDING_SCREENS[currentIndex];

  return (
    <SafeAreaView style={styles.bg}>
      <View style={styles.centerWrapper}>
        <View style={styles.card}>
          <Image
            source={screen.image}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.title}>{t(screen.title1)}</Text>
          <Text style={styles.title}>{t(screen.title2)}</Text>
          <Text style={styles.desc}>{t(screen.desc1)}</Text>
          <Text style={styles.desc}>{t(screen.desc2)}</Text>
          <View style={styles.paginationRow}>
            {ONBOARDING_SCREENS.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, currentIndex === idx && styles.activeDot]}
              />
            ))}
          </View>
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={handleBack}
              disabled={currentIndex === 0}
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            >
              <Text style={styles.navBtnText}>{currentIndex > 0 ? 'Back' : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>{currentIndex === ONBOARDING_SCREENS.length - 1 ? t('Onboarding.createAccount') : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => navigation.navigate('Login')}
          type="TERTIARY"
          text={t('Onboarding.alreadyAccount')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    maxWidth: 500,
    width: '95%',
    maxHeight: 500,
    alignSelf: 'center',
  },
  logo: {
  
    width: "100%",
    height: 250,
    borderRadius: 32,
    marginBottom: 24,
    marginTop: 8,
    backgroundColor: '#F7F0FF',
    borderWidth: 2,
    borderColor: '#F7F0FF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#7B2FF2',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  desc: {
    fontSize: 15,
    color: '#F357A8',
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '500',
    opacity: 0.85,
    marginTop: 2,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E9D7FF',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#7B2FF2',
    width: 18,
    borderRadius: 9,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    marginBottom: 2,
  },
  navBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#F7F0FF',
    minWidth: 80,
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: '#7B2FF2',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
});

export default OnboardingFlow;
