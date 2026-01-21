using System.Collections.Generic;
using System.Threading.Tasks;
using DistributedApp.Auth.Domain.Entities;

namespace DistributedApp.Auth.Application.Interface
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> GetByUsernameAsync(string nombreUsuario);

        // Modificado: Ahora traerá todos (activos e inactivos)
        Task<IEnumerable<Usuario>> GetAllAsync();

        Task<Usuario?> GetByIdAsync(int id);
        Task<int> CreateAsync(Usuario usuario);
        Task<bool> UpdateAsync(Usuario usuario);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateStatusAsync(int id, bool activo);
    }
}