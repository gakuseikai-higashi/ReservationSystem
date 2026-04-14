import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiRequest, ApiError, setLogoutCallback } from '../../../lib/api';
import { APP_CONFIG } from '../../../shared/constants';

const backendUrl = APP_CONFIG.BACKEND_URL;

/**
 * 認証コンテキストの型定義
 */
interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  forceLogout: (message?: string) => void;
  loading: boolean;
}

/**
 * 認証コンテキスト
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * 認証プロバイダーコンポーネント
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * 強制ログアウト処理（トークン期限切れなど）
   */
  const forceLogout = (message?: string) => {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    setIsAuthenticated(false);

    // エラーメッセージを表示
    const defaultMessage = 'セッションが期限切れです。再度ログインしてください。';
    alert(message || defaultMessage);

    // ログインページにリダイレクト（管理者ページの場合）
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin';
    }
  };

  /**
   * 初期化時にlocalStorageから認証状態を読み込み
   */
  useEffect(() => {
    // グローバルログアウトコールバックを設定
    setLogoutCallback(forceLogout);

    const checkAuthStatus = async () => {
      const authToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

      if (authToken) {
        try {
          // 本番環境：トークンの有効性をAPIで検証
          const response = await apiRequest(`${backendUrl}/api/auth/verify`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            // トークンが無効な場合は削除
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('トークン検証エラー:', error);
          // ネットワークエラーなどの場合もトークンを削除
          localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
          setIsAuthenticated(false);
        }
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 定期的なトークン有効性チェック（認証済みの場合のみ）
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(async () => {
      const authToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

      if (!authToken) {
        forceLogout('認証トークンが見つかりません。');
        return;
      }

      try {
        const response = await apiRequest(`${backendUrl}/api/auth/verify`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          forceLogout('セッションが期限切れになりました。');
        }
      } catch (error) {
        console.error('トークン検証エラー:', error);
        forceLogout('認証の確認中にエラーが発生しました。');
      }
    }, 1 * 60 * 1000); // 50分おきにチェック

    return () => clearInterval(intervalId);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * ログイン処理
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // 本番環境のログインAPI
      const response = await apiRequest(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { accessToken: token } = await response.json();
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
        setIsAuthenticated(true);
        return true;
      } else {
        // レスポンスの詳細エラー情報を取得
        const errorData = await response
          .json()
          .catch(() => ({ message: 'ログインに失敗しました' }));
        console.error('ログインエラー:', errorData);
        return false;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('ログインエラー:', error.message);
      } else {
        console.error('ログインエラー:', error);
      }
      return false;
    }
  };

  /**
   * ログアウト処理
   */
  const logout = () => {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    forceLogout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 認証フック
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
