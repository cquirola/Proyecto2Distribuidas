
import { apiAuth } from "../../../core/api/axios";


export const getUsers = async (params = {}) => {
  // params: { page, size, username, email, role, activo }
  const { page = 1, size = 10, username, email, role, activo } = params;
  const resp = await apiAuth.get("/usuarios", {
    params: {
      page,
      size,
      username: username || undefined,
      email: email || undefined,
      role: role || undefined,
      activo: typeof activo === "boolean" ? activo : undefined,
    },
  });
  return resp.data;
};

export const createUser = async (payload) => {
  // payload: { NombreUsuario, Contrasena, NombreCompleto, Correo, Rol, Activo }
  const resp = await apiAuth.post("/usuarios", payload);
  return resp.data;
};

export const updateUser = async (idUsuario, payload) => {
  // payload: { NombreUsuario, Contrasena?, NombreCompleto, Correo, Rol, Activo }
  const resp = await apiAuth.put(`/usuarios/${idUsuario}`, payload);
  return resp.data;
};

export const deleteUser = async (idUsuario) => {
  const resp = await apiAuth.delete(`/usuarios/${idUsuario}`);
  return resp.data;
};

export const toggleActive = async (idUsuario, activo) => {
  // Si tu backend tiene un endpoint específico de estado, ajusta aquí:
  const resp = await apiAuth.patch(`/usuarios/${idUsuario}/estado`, { Activo: activo });
  return resp.data;
};

// (Opcional) Reset de contraseña si el backend lo soporta
export const resetPassword = async (idUsuario) => {
  const resp = await apiAuth.post(`/usuarios/${idUsuario}/reset-password`);
  return resp.data;
};
``
