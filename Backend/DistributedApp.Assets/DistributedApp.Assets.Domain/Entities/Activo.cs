namespace DistributedApp.Assets.Domain.Entities;

public class Activo
{
    public int IdActivo { get; set; }
    public string Nombre { get; set; } = string.Empty;

    // Total de periodos en los que se depreciará el activo
    public int PeriodosDepreciacionTotal { get; set; }

    // Valor de compra del activo
    public decimal ValorCompra { get; set; }

    // FK
    public int IdTipoActivo { get; set; }

    public bool IsActivo { get; set; } = true;
    // Campo útil para listar (JOIN)
    public string? TipoActivoNombre { get; set; }
}
