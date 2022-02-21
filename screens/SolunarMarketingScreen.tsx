import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import Teaser from '../components/Teaser';

interface Props {}

const SolunarMarketingScreen: React.FC<Props> = ({}) => {
  const { width } = useWindowDimensions();
  return (
    <Teaser
      title="Anticipate Feeding Periods With Solunar Theory"
      description="Solunar theory says that there are four time periods during the day when fish will be more active.  When solunar theory is paired with other knowledge of what causes fish to feed (tides, sunrise, etc.), you can increase your chances of a great trip."
      buttonSubtitle="Purchase Salty Solutions Premium for to access satellite imagery."
    >
      <Image
        source={require('../assets/solunar.jpg')}
        style={{
          width: width - 40,
          height: (width - 40) / 0.95,
          marginTop: 10,
          marginBottom: 20,
        }}
        resizeMode="stretch"
      />
    </Teaser>
  );
};

export default SolunarMarketingScreen;
