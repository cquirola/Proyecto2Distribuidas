-- 1. Crear la tabla
CREATE TABLE Usuarios (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    NombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    Contrasena VARCHAR(100) NOT NULL, -- Recuerda: Texto plano no es seguro para prod, pero OK para desarrollo
    NombreCompleto VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) NOT NULL,
    Rol VARCHAR(20) NOT NULL CHECK (Rol IN ('ADMIN', 'USER')),
    Activo BIT NOT NULL DEFAULT 1
);
GO