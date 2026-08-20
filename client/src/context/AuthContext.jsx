import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/initialData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('loadlink_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // Default to Shipper Rahul Sharma
  });

  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('loadlink_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('loadlink_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('loadlink_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const switchUser = (userId) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const loginAsRole = (role) => {
    const target = allUsers.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const updateUserWallet = (userId, amountDelta) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, walletBalance: Math.max(0, (u.walletBalance || 0) + amountDelta) };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const registerUser = (userData) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+91 99999 88888',
      role: userData.role || 'SHIPPER',
      city: userData.city || 'Delhi NCR',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      walletBalance: userData.role === 'DRIVER' ? 5000 : 15000,
      driverDetails: userData.role === 'DRIVER' ? {
        licenseNumber: userData.licenseNumber || 'DL-2026-PENDING',
        vehicleNumber: userData.vehicleNumber || 'HR 26 AB 1234',
        truckModel: userData.truckModel || 'Eicher Pro 14ft',
        truckType: 'Covered Container',
        totalCapacityKg: Number(userData.totalCapacityKg) || 3000,
        totalVolumeM3: Number(userData.totalVolumeM3) || 25,
        rating: 5.0,
        tripsCompleted: 0,
        verified: true
      } : undefined
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      allUsers,
      switchUser,
      loginAsRole,
      registerUser,
      updateUserWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
