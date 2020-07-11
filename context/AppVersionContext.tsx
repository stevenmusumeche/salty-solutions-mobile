import { useAppVersionQuery } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import compareVersions from 'compare-versions';
import Constants from 'expo-constants';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import ForceUpgrade from '../components/ForceUpgrade';

export interface VersionInfo {
  belowMinimum: boolean;
  newVersionAvailable: boolean;
  buildVersion: string;
  minimum?: string;
  current?: string;
  loaded: boolean;
  upgradeUrl: string;
}

export const AppVersionContext = createContext({} as VersionInfo);

export const AppVersionContextProvider: React.FC = ({ children }) => {
  const playStoreUrl =
    'http://play.google.com/store/apps/details?id=com.musumeche.salty.solutions';
  const appStoreUrl = 'http://itunes.apple.com/us/app/id1511737992&mt=8';

  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    belowMinimum: false,
    newVersionAvailable: false,
    buildVersion: Constants.manifest.version || '',
    loaded: false,
    upgradeUrl: Platform.OS === 'ios' ? appStoreUrl : playStoreUrl,
  });

  const [{ fetching, data, error }] = useAppVersionQuery();

  const providerValue: VersionInfo = useMemo(() => versionInfo, [versionInfo]);

  useEffect(() => {
    if (fetching) {
      return;
    }
    if (error) {
      setVersionInfo((cur) => ({ ...cur, loaded: true }));
    }
    if (!data) {
      return;
    }

    let supportedVersion: typeof data.appVersion.ios;
    if (Platform.OS === 'ios') {
      supportedVersion = data.appVersion.ios;
    } else if (Platform.OS === 'android') {
      supportedVersion = data.appVersion.android;
    } else {
      throw new Error('unknown platform');
    }

    const belowMinimum = compareVersions.compare(
      String(Constants.manifest.version),
      supportedVersion.minimumSupported,
      '<',
    );
    const newVersionAvailable = compareVersions.compare(
      String(Constants.manifest.version),
      supportedVersion.current,
      '<',
    );

    setVersionInfo((cur) => ({
      ...cur,
      belowMinimum,
      newVersionAvailable,
      buildVersion: Constants.manifest.version || '',
      minimum: supportedVersion.minimumSupported,
      current: supportedVersion.current,
      loaded: true,
    }));
  }, [fetching, data, error]);

  if (!versionInfo.loaded) {
    return null;
  }

  return (
    <AppVersionContext.Provider value={providerValue}>
      {versionInfo.belowMinimum ? (
        <ForceUpgrade versionInfo={versionInfo} />
      ) : (
        children
      )}
    </AppVersionContext.Provider>
  );
};

export const useAppVersionContext = () => useContext(AppVersionContext);
