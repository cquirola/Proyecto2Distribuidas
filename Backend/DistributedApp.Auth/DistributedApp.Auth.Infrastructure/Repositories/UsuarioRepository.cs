using Dapper;
using DistributedApp.Auth.Application.Interface;
using DistributedApp.Auth.Application.Interfaces;

// using DistributedApp.Auth.Application.Interfaces; // BORRAR: Probablemente duplicado o innecesario
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
            // Validamos que exista y que el nombre coincida
            var sql = "SELECT * FROM Usuarios WHERE NombreUsuario = @NombreUsuario";
            return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { NombreUsuario = nombreUsuario });
        }

        public async Task<IEnumerable<Usuario>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
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

            string sql;

            // Si la contraseña viene vacía, NO la actualizamos
            if (string.IsNullOrEmpty(usuario.Contrasena))
            {
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
                // Si trae contraseña, la actualizamos también
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
            var sql = "DELETE FROM Usuarios WHERE IdUsuario = @Id";
            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0;
        }

        public async Task<bool> UpdateStatusAsync(int id, bool activo)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = "UPDATE Usuarios SET Activo = @Activo WHERE IdUsuario = @Id";
            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, Activo = activo });
            return rowsAffected > 0;
        }

        // --- MÉTODO CORREGIDO PARA DAPPER ---
        public async Task<Usuario?> GetByCorreoAsync(string correo)
        {
            using var connection = _connectionFactory.CreateConnection();

            // Usamos SQL directo igual que en los otros métodos
            var sql = "SELECT * FROM Usuarios WHERE Correo = @Correo";

            return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { Correo = correo });
        }
    }
}