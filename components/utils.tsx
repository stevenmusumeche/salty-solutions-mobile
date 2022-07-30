import { Platform } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { Platform as RNPlatform } from 'react-native';

export function getPlatform(
  reactNativePlatform: typeof RNPlatform.OS,
): Platform {
  return reactNativePlatform === 'ios' ? Platform.Ios : Platform.Android;
}
