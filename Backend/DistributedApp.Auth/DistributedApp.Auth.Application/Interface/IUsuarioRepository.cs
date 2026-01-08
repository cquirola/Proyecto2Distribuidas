using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DistributedApp.Auth.Domain.Entities;

namespace DistributedApp.Auth.Application.Interface
{
    public interface IUsuarioRepository
    {
       
        Task<Usuario?> GetByUsernameAsync(string nombreUsuario);

        Task<IEnumerable<Usuario>> GetAllAsync();
        Task<Usuario?> GetByIdAsync(int id);
        Task<int> CreateAsync(Usuario usuario);
        Task<bool> UpdateAsync(Usuario usuario);
        Task<bool> DeleteAsync(int id);
    }
}
