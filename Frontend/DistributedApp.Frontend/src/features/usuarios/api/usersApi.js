import { apiAuth } from "../../../core/api/axios";

// GET: Trae TODOS los usuarios
export const getUsers = async () => {
  const resp = await apiAuth.get("/usuarios");
  return resp.data; // Se asume que el backend devuelve un array directo o { data: [] }
};

export const createUser = async (payload) => {
  const resp = await apiAuth.post("/usuarios", payload);
  return resp.data;
};

export const updateUser = async (idUsuario, payload) => {
  const resp = await apiAuth.put(`/usuarios/${idUsuario}`, payload);
  return resp.data;
};

export const deleteUser = async (idUsuario) => {
  const resp = await apiAuth.delete(`/usuarios/${idUsuario}`);
  return resp.data;
};

export const toggleActive = async (idUsuario, activo) => {
  // Ajustado para coincidir con tu posible endpoint
  const resp = await apiAuth.patch(`/usuarios/${idUsuario}/estado`, { Activo: activo });
  return resp.data;
};