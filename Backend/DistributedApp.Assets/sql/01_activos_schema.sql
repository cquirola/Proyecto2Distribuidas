-- =============================================
--  MODULO: ACTIVOS (Azure SQL / SQL Server)
--  Crea esquema y tablas base para Tipos de Activo y Activos
-- =============================================

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Activos')
BEGIN
    EXEC('CREATE SCHEMA Activos');
END
GO

IF OBJECT_ID('Activos.TipoActivos', 'U') IS NULL
BEGIN
    CREATE TABLE Activos.TipoActivos (
        IdTipoActivo INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL,
        Activo BIT NOT NULL CONSTRAINT DF_TipoActivos_Activo DEFAULT(1),
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_TipoActivos_FechaCreacion DEFAULT(SYSDATETIME())
    );

    CREATE UNIQUE INDEX UX_TipoActivos_Nombre
        ON Activos.TipoActivos (Nombre)
        WHERE Activo = 1;
END
GO

IF OBJECT_ID('Activos.Activos', 'U') IS NULL
BEGIN
    CREATE TABLE Activos.Activos (
        IdActivo INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Nombre NVARCHAR(200) NOT NULL,
        PeriodosDepreciacionTotal INT NOT NULL,
        ValorCompra DECIMAL(18,2) NOT NULL,
        IdTipoActivo INT NOT NULL,
        Activo BIT NOT NULL CONSTRAINT DF_Activos_Activo DEFAULT(1),
        FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_Activos_FechaCreacion DEFAULT(SYSDATETIME()),

        CONSTRAINT FK_Activos_TipoActivos
            FOREIGN KEY (IdTipoActivo)
            REFERENCES Activos.TipoActivos(IdTipoActivo)
    );

    CREATE INDEX IX_Activos_IdTipoActivo ON Activos.Activos (IdTipoActivo);
END
GO
