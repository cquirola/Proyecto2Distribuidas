namespace DistributedApp.Assets.Application.DTOs;

public record ActivoResponse(
    int IdActivo,
    string Nombre,
    int PeriodosDepreciacionTotal,
    decimal ValorCompra,
    int IdTipoActivo,
    string? TipoActivoNombre
);

public record ActivoCreateRequest(
    string Nombre,
    int PeriodosDepreciacionTotal,
    decimal ValorCompra,
    int IdTipoActivo
);

public record ActivoUpdateRequest(
    string Nombre,
    int PeriodosDepreciacionTotal,
    decimal ValorCompra,
    int IdTipoActivo
);
