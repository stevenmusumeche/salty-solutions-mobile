import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Auth0, { Credentials } from 'react-native-auth0';
import jwt_decode from 'jwt-decode';
import { Maybe } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { isAfter } from 'date-fns';
import * as SecureStore from 'expo-secure-store';

interface UserContext {
  user: User;
  actions: {
    login: () => void;
    logout: () => void;
  };
}

const auth0 = new Auth0({
  domain: 'dev-nzoppbnb.us.auth0.com',
  clientId: 'Ox02XdfLPCDeAyq0zmMbyKmhDd6zyIjQ',
});

export const UserContext = createContext({} as UserContext);

export const UserContextProvider: React.FC = ({ children }) => {
  const savedCredentialsKey = 'auth0Creds';
  const [userCredentials, setUserCredentials] = useState<UserCredentials>();

  const handleNewCreds = useCallback(async (auth0Creds: Credentials) => {
    const credentials = {
      credentials: auth0Creds,
      token: enrichToken(jwt_decode<RawToken>(auth0Creds.idToken)),
    };
    setUserCredentials(credentials);
    await SecureStore.setItemAsync(
      savedCredentialsKey,
      JSON.stringify(auth0Creds),
    ).catch(() => {});
  }, []);

  const login = useCallback(async () => {
    try {
      const auth0Creds = await auth0.webAuth.authorize({
        scope: 'openid profile email offline_access',
      });
      handleNewCreds(auth0Creds);
    } catch (e) {
      // todo handle login error somehow
      console.log('Error logging in', e);
    }
  }, [handleNewCreds]);

  const logout = useCallback(async () => {
    try {
      setUserCredentials(undefined);
      await SecureStore.deleteItemAsync(savedCredentialsKey).catch(() => {});
      await auth0.webAuth.clearSession();
    } catch (e) {
      // todo handle logout error somehow
      console.log('error logging out', e);
    }
  }, []);

  // restore credentials from SecureStore when the app starts up
  useEffect(() => {
    const restoreCredentials = async () => {
      const savedCredentials = await SecureStore.getItemAsync(
        savedCredentialsKey,
      ).catch((e) => console.error(e));

      if (savedCredentials) {
        const auth0Creds = JSON.parse(savedCredentials);
        handleNewCreds(auth0Creds);
      }
    };

    restoreCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // poll for credential validity
  useEffect(() => {
    let interval: Maybe<ReturnType<typeof setInterval>> = null;

    const tryRefresh = async () => {
      if (!userCredentials?.credentials.refreshToken) {
        return;
      }

      try {
        const auth0Creds = await auth0.auth.refreshToken({
          refreshToken: userCredentials.credentials.refreshToken,
        });

        const newCreds = { ...userCredentials.credentials, ...auth0Creds };

        console.log('Successfully refreshed token');
        handleNewCreds(newCreds);
      } catch (e) {
        if (tokenIsExpired(userCredentials.token)) {
          // force logout
          logout();
          return;
        }
        console.log(
          'Error refreshing token, but ignoring because the token is not expired',
        );
      }
    };

    if (userCredentials?.credentials) {
      // if token is expired right when we call this (restored from session), then try to refresh it
      if (tokenIsExpired(userCredentials.token)) {
        tryRefresh();
      }

      // try to refresh the token every hour
      interval = setInterval(tryRefresh, 60000 * 60);
    } else {
      if (interval) {
        clearTimeout(interval);
      }
    }

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [handleNewCreds, logout, userCredentials]);

  const providerValue: UserContext = useMemo(
    () => ({
      user: userCredentials
        ? {
            isLoggedIn: true,
            id: userCredentials.token.sub,
            name: userCredentials.token.name,
            email: userCredentials.token.email,
            picture: userCredentials.token.picture,
          }
        : {
            isLoggedIn: false,
          },
      actions: {
        login,
        logout,
      },
    }),
    [login, logout, userCredentials],
  );

  return (
    <UserContext.Provider value={providerValue}>
      {children}
    </UserContext.Provider>
  );
};

function enrichToken(rawToken: RawToken): Token {
  return {
    ...rawToken,
    expiration: new Date(rawToken.exp * 1000),
  };
}

function tokenIsExpired(token: Token) {
  return isAfter(new Date(), token.expiration);
}

interface RawToken {
  aud: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  name: string;
  nickname: string;
  picture: string;
  sub: string;
  updated_at: number;
}

interface Token extends Omit<RawToken, 'expiration'> {
  expiration: Date;
}

interface UserCredentials {
  credentials: Credentials;
  token: Token;
}

export type User =
  | {
      isLoggedIn: true;
      id: string;
      email: string;
      name: string;
      picture: string;
    }
  | { isLoggedIn: false };

export const useUserContext = () => useContext(UserContext);
