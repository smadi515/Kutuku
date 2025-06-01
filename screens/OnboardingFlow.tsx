import React, {useRef, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import {useTranslation} from 'react-i18next';

const {width} = Dimensions.get('window');

const OnboardingFlow: React.FC = ({navigation}: any) => {
  const {t} = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({x: width, animated: false});
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    navigation.navigate('CreateAcount');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{flexDirection: 'row-reverse'}}>
        {/* Screen 3 */}
        <View style={[styles.logoContainer, {width}]}>
          <Image
            source={require('../assets/Maskgroup1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.textStyle}>{t('Onboarding.screen3.title1')}</Text>
          <Text style={styles.textStyle}>{t('Onboarding.screen3.title2')}</Text>
          <Text style={styles.subText}>{t('Onboarding.screen3.desc1')}</Text>
          <Text style={styles.subText}>{t('Onboarding.screen3.desc2')}</Text>
        </View>

        {/* Screen 2 */}
        <View style={[styles.logoContainer, {width}]}>
          <Image
            source={require('../assets/Maskgroup1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.textStyle}>{t('Onboarding.screen2.title1')}</Text>
          <Text style={styles.textStyle}>{t('Onboarding.screen2.title2')}</Text>
          <Text style={styles.subText}>{t('Onboarding.screen2.desc1')}</Text>
          <Text style={styles.subText}>{t('Onboarding.screen2.desc2')}</Text>
        </View>

        {/* Screen 1 */}
        <View style={[styles.logoContainer, {width}]}>
          <Image
            source={require('../assets/Maskgroup2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.textStyle}>{t('Onboarding.screen1.title1')}</Text>
          <Text style={styles.textStyle}>{t('Onboarding.screen1.title2')}</Text>
          <Text style={styles.subText}>{t('Onboarding.screen1.desc1')}</Text>
          <Text style={styles.subText}>{t('Onboarding.screen1.desc2')}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          type="PRIMARY"
          onPress={handleNext}
          text={t('Onboarding.createAccount')}
        />
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
  container: {flex: 1, backgroundColor: '#fff'},
  logoContainer: {
    paddingHorizontal: 50,
    alignItems: 'center',
    justifyContent: 'center',
    height: '80%',
  },
  subText: {
    textAlign: 'center',
    color: 'gray',
    fontWeight: '300',
  },
  logo: {
    width: '100%',
    height: '70%',
    borderRadius: 80,
  },
  textStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {alignItems: 'center', paddingTop: 15},
});

export default OnboardingFlow;
