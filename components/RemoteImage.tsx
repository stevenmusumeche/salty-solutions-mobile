import React, { FC, useEffect, useState } from 'react';
import { Image } from 'react-native';

interface Props {
  imageUrl: string;
  desiredWidth: number;
}

interface Dims {
  width: number;
  height: number;
}

const RemoteImage: FC<Props> = ({ imageUrl, desiredWidth }) => {
  const [dims, setDims] = useState<Dims>();

  useEffect(() => {
    Image.getSize(
      imageUrl,
      (width, height) => {
        const resizedWidth = desiredWidth;
        const resizedHeight = (height * resizedWidth) / width;

        setDims({ width: desiredWidth, height: resizedHeight });
      },
      () => {},
    );
  }, [desiredWidth, imageUrl]);

  if (!dims) {
    return null;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{ width: dims.width, height: dims.height }}
    />
  );
};

export default RemoteImage;
