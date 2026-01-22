-- =============================================
--  MODULO: ACTIVOS - Datos iniciales de prueba
-- =============================================

-- Tipos de activo (ejemplo)
IF NOT EXISTS (SELECT 1 FROM Activos.TipoActivos)
BEGIN
    INSERT INTO Activos.TipoActivos (Nombre, Activo)
    VALUES
        (N'Equipo de cómputo', 1),
        (N'Mobiliario', 1),
        (N'Vehículos', 1),
        (N'Equipo de oficina', 1);
END
GO

-- Activos (ejemplo)
IF NOT EXISTS (SELECT 1 FROM Activos.Activos)
BEGIN
    DECLARE @idComputo INT = (SELECT TOP 1 IdTipoActivo FROM Activos.TipoActivos WHERE Nombre = N'Equipo de cómputo');
    DECLARE @idMobiliario INT = (SELECT TOP 1 IdTipoActivo FROM Activos.TipoActivos WHERE Nombre = N'Mobiliario');

    INSERT INTO Activos.Activos (Nombre, PeriodosDepreciacionTotal, ValorCompra, IdTipoActivo, Activo)
    VALUES
        (N'Laptop Dell 14"', 36, 950.00, @idComputo, 1),
        (N'Escritorio de madera', 60, 220.00, @idMobiliario, 1);
END
GO
