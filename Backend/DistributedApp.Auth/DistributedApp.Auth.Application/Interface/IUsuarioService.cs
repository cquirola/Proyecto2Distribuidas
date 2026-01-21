using DistributedApp.Auth.Domain.Entities;
using DistributedApp.Auth.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DistributedApp.Auth.Application.Interface
{
    public interface IUsuarioService
    {
        // El método de login ahora devolverá un objeto con Token y datos, o null si falla
        Task<AuthResponseDto> AuthenticateAsync(LoginRequest request);

        Task<IEnumerable<Usuario>> GetAllAsync();
        Task<Usuario?> GetByIdAsync(int id);
        Task<Usuario> CreateAsync(Usuario usuario);
        Task<bool> UpdateAsync(int id, Usuario usuario);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateStatusAsync(int id, bool activo);
        Task<AuthResponseDto> AuthenticateGoogleAsync(string googleCredential);
    }
}