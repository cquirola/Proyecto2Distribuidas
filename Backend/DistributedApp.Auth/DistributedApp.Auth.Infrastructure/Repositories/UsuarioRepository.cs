using Dapper;
using DistributedApp.Auth.Application.Interface;
using DistributedApp.Auth.Application.Interfaces;
using DistributedApp.Auth.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
            var sql = "SELECT * FROM Usuarios WHERE NombreUsuario = @NombreUsuario AND Activo = 1";
            return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { NombreUsuario = nombreUsuario });
        }

        public async Task<IEnumerable<Usuario>> GetAllAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = "SELECT * FROM Usuarios WHERE Activo = 1";
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
                
                -- Recuperar el ID generado automáticamente
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await connection.QuerySingleAsync<int>(sql, usuario);
        }

        public async Task<bool> UpdateAsync(Usuario usuario)
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = @"
                UPDATE Usuarios
                SET NombreUsuario = @NombreUsuario,
                    Contrasena = @Contrasena,
                    NombreCompleto = @NombreCompleto,
                    Correo = @Correo,
                    Rol = @Rol
                WHERE IdUsuario = @IdUsuario";

            var rowsAffected = await connection.ExecuteAsync(sql, usuario);
            return rowsAffected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            // Baja Lógica: No borramos el registro, solo lo desactivamos
            var sql = "UPDATE Usuarios SET Activo = 0 WHERE IdUsuario = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0;
        }
    }
}
