import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from '../components/icon';
import Header from '../components/Header';
import {useTranslation} from 'react-i18next';

const HelpSupportScreen: React.FC = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const faqData = t('HelpSupport.faq', {returnObjects: true}) as {
    question: string;
    answer: string;
  }[];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(2);

  const toggleExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <View style={[styles.container, {direction: isRTL ? 'rtl' : 'ltr'}]}>
      <Header
        showBack={true}
        showImage={false}
        title={t('HelpSupport.title')}
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />

      <ScrollView style={{paddingHorizontal: 15}}>
        {faqData.map((item, index) => (
          <View key={index} style={styles.accordionItem}>
            <TouchableOpacity
              onPress={() => toggleExpand(index)}
              style={styles.questionRow}>
              <Text style={styles.questionText}>{item.question}</Text>
              <Icon
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                type="ionicon"
                size={20}
              />
            </TouchableOpacity>
            {expandedIndex === index && item.answer !== '' && (
              <Text style={styles.answerText}>{item.answer}</Text>
            )}
            <View style={styles.separator} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  accordionItem: {
    paddingTop: 15,
    marginBottom: 8,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    paddingBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});

export default HelpSupportScreen;
