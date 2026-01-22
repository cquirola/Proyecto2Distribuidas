using DistributedApp.Assets.Domain.Entities;

namespace DistributedApp.Assets.Application.Interfaces;

public interface IActivoRepository
{
    Task<IEnumerable<IsActivo>> GetAllAsync();
    Task<Activo?> GetByIdAsync(int id);
    Task<IEnumerable<IsActivo>> SearchAsync(string term);
    Task<int> CreateAsync(IsActivo entity);
    Task<bool> UpdateAsync(IsActivo entity);
    Task<bool> DeleteAsync(int id);
}
