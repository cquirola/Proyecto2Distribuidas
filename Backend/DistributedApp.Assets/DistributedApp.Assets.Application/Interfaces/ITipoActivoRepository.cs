using DistributedApp.Assets.Domain.Entities;

namespace DistributedApp.Assets.Application.Interfaces;

public interface ITipoActivoRepository
{
    Task<IEnumerable<TipoActivo>> GetAllAsync();
    Task<TipoActivo?> GetByIdAsync(int id);
    Task<IEnumerable<TipoActivo>> SearchAsync(string term);
    Task<int> CreateAsync(TipoActivo entity);
    Task<bool> UpdateAsync(TipoActivo entity);
    Task<bool> DeleteAsync(int id);
}
