import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from '../components/icon';
import Header from '../components/Header';
import {useTranslation} from 'react-i18next';
import {fetchSocialMediaLinks} from '../lib/api'; // adjust path

// 🔰 Add this mapping at the top of the file
const socialMediaIcons: Record<
  string,
  {name: string; type: string; color: string}
> = {
  facebook: {name: 'facebook', type: 'fa', color: '#3b5998'},
  twitter: {name: 'twitter', type: 'fa', color: '#1da1f2'},
  instagram: {name: 'instagram', type: 'fa', color: '#e1306c'},
  pinterest: {name: 'pinterest', type: 'fa', color: '#bd081c'},
};

const HelpSupportScreen: React.FC = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const faqData = t('HelpSupport.faq', {returnObjects: true}) as {
    question: string;
    answer: string;
  }[];

  const [expandedIndex, setExpandedIndex] = useState<number | null>(2);
  const [socialLinks, setSocialLinks] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const loadSocialLinks = async () => {
      const links = await fetchSocialMediaLinks();
      if (links) setSocialLinks(links);
    };

    loadSocialLinks();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err =>
      console.error('Failed to open URL:', err),
    );
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

        {/* Social Media Section */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>{t('HelpSupport.followUs')}</Text>
          {Object.entries(socialLinks).map(([platform, url]) => {
            const icon = socialMediaIcons[platform.toLowerCase()] || {
              name: 'globe',
              type: 'feather',
              color: '#555',
            };
            return (
              <TouchableOpacity
                key={platform}
                onPress={() => openLink(url)}
                style={styles.socialRow}>
                <View style={styles.iconLabelRow}>
                  <Icon
                    name={icon.name}
                    type={icon.type}
                    size={20}
                    color={icon.color}
                    style={styles.socialIcon}
                  />
                  <Text style={styles.socialText}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Text>
                </View>
                <Icon
                  name="external-link"
                  type="feather"
                  size={18}
                  color="#888"
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  accordionItem: {paddingTop: 15, marginBottom: 8},
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  questionText: {fontSize: 15, fontWeight: '500'},
  answerText: {fontSize: 14, color: '#555', paddingBottom: 8},
  separator: {height: 1, backgroundColor: '#eee'},

  // 🔧 Added social styles
  socialSection: {
    marginTop: 25,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    marginRight: 10,
  },
  socialText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default HelpSupportScreen;
