import React from 'react';
import {TouchableOpacity, Image, StyleSheet, Alert, Text} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from './icon';
type Props = {
  image: any;
  onPick: (asset: any) => void;
  extraStyle?: object;
  text?: string;
  customIcon?: React.ReactNode;
};

const ImagePickerComponent: React.FC<Props> = ({
  image,
  onPick,
  extraStyle,
  text,
  customIcon,
}) => {
  const handleSelectImage = () => {
    Alert.alert(
      'Select source',
      'Where do you want to download the image from?',
      [
        {
          text: 'camera',
          onPress: async () => {
            const result = await launchCamera({mediaType: 'photo'});
            if (!result.didCancel && result.assets?.[0]) {
              onPick(result.assets[0]);
            }
          },
        },
        {
          text: 'Exhibition',
          onPress: async () => {
            const result = await launchImageLibrary({mediaType: 'photo'});
            if (!result.didCancel && result.assets?.[0]) {
              onPick(result.assets[0]);
            }
          },
        },
        {text: 'cancel', style: 'cancel'},
      ],
    );
  };

  return (
    <TouchableOpacity style={extraStyle} onPress={handleSelectImage}>
      {image?.uri ? (
        <Image source={{uri: image.uri}} style={(styles.image, extraStyle)} />
      ) : (
        <React.Fragment>
          <TouchableOpacity
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            onPress={handleSelectImage}>
            {customIcon ? (
              customIcon
            ) : (
              <Icon type="ant" name="pluscircleo" color="black" size={20} />
            )}
            {text && <Text>{text}</Text>}
          </TouchableOpacity>
        </React.Fragment>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

export default ImagePickerComponent;
