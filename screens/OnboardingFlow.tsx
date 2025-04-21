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

const {width} = Dimensions.get('window');

const OnboardingFlow: React.FC = ({navigation}: any) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({x: width, animated: false});
    }, 100); // wait 100ms

    return () => clearTimeout(timer); // clean up
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
        {/* First screen */}
        <View style={[styles.logoContainer, {width}]}>
          <Image
            source={require('../assets/Maskgroup1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.textStyle}>Various collection Of The</Text>
          <Text style={styles.textStyle}>Latest Products</Text>
          <Text style={styles.subText}>
            urna amet,suspendisse ullamcarper ac elit diam
          </Text>
          <Text style={styles.subText}>facillsis cursus vestibulum</Text>
        </View>

        {/* Second screen — this will show first */}
        <View style={[styles.logoContainer, {width}]}>
          <Image
            source={require('../assets/Maskgroup1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.textStyle}>Complete collection Of</Text>
          <Text style={styles.textStyle}>colors and Sizes</Text>
          <Text style={styles.subText}>
            urna amet,suspendisse ullamcarper ac elit diam
          </Text>
          <Text style={styles.subText}>facillsis cursus vestibulum</Text>
        </View>

        <View style={[styles.logoContainer, {width}]}>
          <Image
            source={require('../assets/Maskgroup2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.textStyle}>Find The Most Suitable</Text>
          <Text style={styles.textStyle}>Outfit For You </Text>
          <Text style={styles.subText}>
            urna amet,suspendisse ullamcarper ac elit diam
          </Text>
          <Text style={styles.subText}>facillsis cursus vestibulum</Text>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <CustomButton
          type="PRIMARY"
          onPress={handleNext}
          text="Create Account"
        />
        <CustomButton
          onPress={() => navigation.navigate('Login')}
          type="TERTIARY"
          text="already have an account"
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
