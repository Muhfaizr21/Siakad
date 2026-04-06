import React, { createContext, useContext, useState } from 'react';

export const mockRoles = [
  {
    id: 1,
    name: 'Ketua Umum (Master Controller)',
    permissions: {
      anggota: ['view', 'create', 'edit', 'delete', 'export'],
      proposal: ['view', 'create', 'edit', 'delete', 'submit'],
      jadwal: ['view', 'create', 'edit', 'delete'],
      absensi: ['view', 'create', 'scan', 'edit', 'export'],
      keuangan: ['view', 'create', 'edit', 'delete', 'export'],
      lpj: ['view', 'create', 'edit', 'delete', 'submit'],
      pengumuman: ['view', 'create', 'edit', 'delete', 'publish'],
      struktur: ['view', 'edit'],
      rbac: ['view', 'create', 'edit', 'delete'],
      aspirasi: ['view', 'create', 'edit', 'delete'],
    }
  },
  {
    id: 2,
    name: 'Sekretaris Umum',
    permissions: {
      anggota: ['view', 'create', 'edit', 'export'],
      proposal: ['view', 'create', 'edit', 'delete', 'submit'],
      jadwal: ['view', 'create', 'edit', 'delete'],
      absensi: ['view', 'create', 'scan', 'export'],
      keuangan: ['view'],
      lpj: ['view', 'create', 'edit', 'submit'],
      pengumuman: ['view', 'create', 'edit', 'delete', 'publish'],
      struktur: ['view', 'edit'],
      aspirasi: ['view', 'create', 'edit'],
    }
  },
  {
    id: 3,
    name: 'Bendahara Umum',
    permissions: {
      anggota: ['view'],
      proposal: ['view'],
      jadwal: ['view'],
      absensi: ['view'],
      keuangan: ['view', 'create', 'edit', 'delete', 'export'],
      lpj: ['view', 'create', 'edit', 'delete', 'submit'],
      pengumuman: ['view'],
      struktur: ['view'],
      aspirasi: ['view'],
    }
  },
  {
    id: 4,
    name: 'Kepala Divisi (Kadiv) / Staf',
    permissions: {
      anggota: ['view'],
      proposal: ['view', 'create', 'edit'],
      jadwal: ['view', 'create', 'edit'],
      absensi: ['view', 'create', 'scan'],
      keuangan: ['view'],
      lpj: ['view', 'create', 'edit'],
      pengumuman: ['view'],
      struktur: ['view'],
      aspirasi: ['view'],
    }
  }
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1, // Change string ID to match backend uint
    name: 'Muhamad Faiz',
    ormawaId: 1,
    role: mockRoles[0] // Start as Master Controller
  });

  const switchMockRole = (roleId) => {
    const r = mockRoles.find(r => r.id === roleId);
    if(r) {
      setUser({ ...user, role: r });
    }
  };

  const hasPermission = (module, action) => {
    if (!user || !user.role || !user.role.permissions[module]) return false;
    return user.role.permissions[module].includes(action);
  };

  return (
    <AuthContext.Provider value={{ user, hasPermission, switchMockRole, mockRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
