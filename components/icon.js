import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Ionicon from 'react-native-vector-icons/Ionicons';
import ZocialIcon from 'react-native-vector-icons/Zocial';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import OcticonIcon from 'react-native-vector-icons/Octicons';
import FAIcon5 from 'react-native-vector-icons/FontAwesome5';
import FoundationIcon from 'react-native-vector-icons/Foundation';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const getIcon = (type = '') => {
  switch (type.toLowerCase()) {
    case 'fontisto':
      return Fontisto;
    case 'material':
      return MaterialIcon;
    case 'evil':
      return EvilIcon;
    case 'feather':
      return Feather;
    case 'ant':
    case 'antdesign':
      return AntDesign;
    case 'simpleline':
      return SimpleLineIcon;
    case 'zocial':
      return ZocialIcon;
    case 'foundation':
      return FoundationIcon;
    case 'fa5':
    case 'fontawesome5':
      return FAIcon5;
    case 'fa':
    case 'fontawesome':
      return FAIcon;
    case 'ionicon':
    case 'ionicons':
      return Ionicon;
    case 'materialcommunity':
    case 'materialcommunityicons':
      return MaterialCommunityIcon;
    case 'entypo':
      return EntypoIcon;
    case 'octicon':
      return OcticonIcon;
    default:
      return FAIcon;
  }
};

const Icon = ({type, size = 24, ...props}) => {
  const FontIcon = getIcon(type);
  return <FontIcon size={size} {...props} />;
};

export default Icon;
