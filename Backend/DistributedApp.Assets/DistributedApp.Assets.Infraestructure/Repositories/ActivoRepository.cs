using Dapper;
using DistributedApp.Assets.Application.Interfaces;
using DistributedApp.Assets.Domain.Entities;

namespace DistributedApp.Assets.Infraestructure.Repositories;

public class ActivoRepository : IActivoRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public ActivoRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<Activo>> GetAllAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT a.IdActivo, a.Nombre, a.PeriodosDepreciacionTotal, a.ValorCompra,
                   a.IdTipoActivo, a.Activo AS IsActivo,
                   t.Nombre AS TipoActivoNombre
            FROM Activos.Activos a
            INNER JOIN Activos.TipoActivos t ON t.IdTipoActivo = a.IdTipoActivo
            WHERE a.Activo = 1
            ORDER BY a.IdActivo DESC";

        return await connection.QueryAsync<Activo>(sql);
    }

    public async Task<Activo?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT a.IdActivo, a.Nombre, a.PeriodosDepreciacionTotal, a.ValorCompra,
                   a.IdTipoActivo, a.Activo AS IsActivo,
                   t.Nombre AS TipoActivoNombre
            FROM Activos.Activos a
            INNER JOIN Activos.TipoActivos t ON t.IdTipoActivo = a.IdTipoActivo
            WHERE a.IdActivo = @Id";

        return await connection.QuerySingleOrDefaultAsync<Activo>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Activo>> SearchAsync(string term)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT a.IdActivo, a.Nombre, a.PeriodosDepreciacionTotal, a.ValorCompra,
                   a.IdTipoActivo, a.Activo AS IsActivo,
                   t.Nombre AS TipoActivoNombre
            FROM Activos.Activos a
            INNER JOIN Activos.TipoActivos t ON t.IdTipoActivo = a.IdTipoActivo
            WHERE a.Activo = 1
              AND (
                    a.Nombre LIKE '%' + @Term + '%'
                    OR t.Nombre LIKE '%' + @Term + '%'
                  )
            ORDER BY a.IdActivo DESC";

        return await connection.QueryAsync<Activo>(sql, new { Term = term });
    }

    public async Task<int> CreateAsync(Activo entity)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            INSERT INTO Activos.Activos (Nombre, PeriodosDepreciacionTotal, ValorCompra, IdTipoActivo, Activo)
            VALUES (@Nombre, @PeriodosDepreciacionTotal, @ValorCompra, @IdTipoActivo, 1);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        return await connection.QuerySingleAsync<int>(sql, entity);
    }

    public async Task<bool> UpdateAsync(Activo entity)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Activos.Activos
            SET Nombre = @Nombre,
                PeriodosDepreciacionTotal = @PeriodosDepreciacionTotal,
                ValorCompra = @ValorCompra,
                IdTipoActivo = @IdTipoActivo
            WHERE IdActivo = @IdActivo";

        var rows = await connection.ExecuteAsync(sql, entity);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "UPDATE Activos.Activos SET Activo = 0 WHERE IdActivo = @Id";
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
