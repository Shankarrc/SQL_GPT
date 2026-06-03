import { create } from 'zustand';

interface DatabaseConnection {
  _id: string;
  name: string;
  type: string;
}

interface DbState {
  activeConnection: DatabaseConnection | null;
  setActiveConnection: (connection: DatabaseConnection | null) => void;
}

export const useDbStore = create<DbState>((set) => ({
  activeConnection: JSON.parse(localStorage.getItem('activeConnection') || 'null'),
  setActiveConnection: (connection) => {
    if (connection) {
      localStorage.setItem('activeConnection', JSON.stringify(connection));
    } else {
      localStorage.removeItem('activeConnection');
    }
    set({ activeConnection: connection });
  },
}));
