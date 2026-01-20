-- 2. Insertar 3 usuarios de prueba
INSERT INTO Usuarios (NombreUsuario, Contrasena, NombreCompleto, Correo, Rol, Activo)
VALUES 
('adminMaik', 'Admin123!', 'Maicol Jimenez', 'admin@proyecto.com', 'ADMIN', 1),
('devUser', 'DevPass2026', 'Desarrollador Junior', 'dev@proyecto.com', 'USER', 1),
('invitado', 'GuestPass', 'Usuario Invitado', 'invitado@proyecto.com', 'USER', 0); -- Este nace inactivo como ejemplo
GO