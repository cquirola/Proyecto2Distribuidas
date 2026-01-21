using Dapper;
using DistributedApp.Auth.Application.Interface;
using DistributedApp.Auth.Application.Interfaces;

// using DistributedApp.Auth.Application.Interfaces; // Verifica si este namespace sobra
using DistributedApp.Auth.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Auth.Infrastructure.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public UsuarioRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<Usuario?> GetByUsernameAsync(string nombreUsuario)
        {
            using var connection = _connectionFactory.CreateConnection();
            // Para el login, usualmente sí queremos que solo entren los activos.
            // Si quieres permitir login a inactivos, quita "AND Activo = 1".
            var sql = "SELECT * FROM Usuarios WHERE NombreUsuario = @NombreUsuario AND Activo = 1";
            return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { NombreUsuario = nombreUsuario });
        }

        public async Task<IEnumerable<Usuario>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            // CAMBIO 1: Quitamos "WHERE Activo = 1" para ver todo el historial en el Dashboard
            var sql = "SELECT * FROM Usuarios ORDER BY IdUsuario DESC";
            return await connection.QueryAsync<Usuario>(sql);
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = "SELECT * FROM Usuarios WHERE IdUsuario = @Id";
            return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { Id = id });
        }

        public async Task<int> CreateAsync(Usuario usuario)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                INSERT INTO Usuarios (NombreUsuario, Contrasena, NombreCompleto, Correo, Rol, Activo, FechaCreacion)
                VALUES (@NombreUsuario, @Contrasena, @NombreCompleto, @Correo, @Rol, 1, GETDATE());
                
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await connection.QuerySingleAsync<int>(sql, usuario);
        }

        public async Task<bool> UpdateAsync(Usuario usuario)
        {
            using var connection = _connectionFactory.CreateConnection();

            // CAMBIO 2: Lógica inteligente para la contraseña.
            // Si la contraseña viene vacía o nula, NO la actualizamos en la BD.
            string sql;

            if (string.IsNullOrEmpty(usuario.Contrasena))
            {
                // Query SIN tocar la contraseña
                sql = @"
                UPDATE Usuarios
                SET NombreUsuario = @NombreUsuario,
                    NombreCompleto = @NombreCompleto,
                    Correo = @Correo,
                    Rol = @Rol,
                    Activo = @Activo
                WHERE IdUsuario = @IdUsuario";
            }
            else
            {
                // Query completa CON contraseña nueva
                sql = @"
                UPDATE Usuarios
                SET NombreUsuario = @NombreUsuario,
                    Contrasena = @Contrasena,
                    NombreCompleto = @NombreCompleto,
                    Correo = @Correo,
                    Rol = @Rol,
                    Activo = @Activo
                WHERE IdUsuario = @IdUsuario";
            }

            var rowsAffected = await connection.ExecuteAsync(sql, usuario);
            return rowsAffected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            // CAMBIO 3: Decidimos si borrar físicamente o lógicamente.
            // Si quieres borrado REAL (DELETE FROM), usa esta línea:
            var sql = "DELETE FROM Usuarios WHERE IdUsuario = @Id";

            // Si prefieres "Baja Lógica" (Desactivar), usa esta:
            // var sql = "UPDATE Usuarios SET Activo = 0 WHERE IdUsuario = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0;
        }

        // --- NUEVO MÉTODO ---
        public async Task<bool> UpdateStatusAsync(int id, bool activo)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = "UPDATE Usuarios SET Activo = @Activo WHERE IdUsuario = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
            return rowsAffected > 0;
        }
    }
}