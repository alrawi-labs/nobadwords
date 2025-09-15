import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

interface User {
  first_name: string;
  last_name: string;
  email_is_activated: Boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    const token = localStorage.getItem("nbw_access_token");
    if (!token) {
      setUser(null);
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.get(
        `${API_URL}/api/account/get_first_last_name/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUser(res.data); // { first_name, last_name }
    } catch (err) {
      console.error("fetchUser error", err);
      // Token geçersizse kullanıcıyı null yap
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("nbw_access_token");
        localStorage.removeItem("nbw_refresh_token");
      }
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda bir kere çağır
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
