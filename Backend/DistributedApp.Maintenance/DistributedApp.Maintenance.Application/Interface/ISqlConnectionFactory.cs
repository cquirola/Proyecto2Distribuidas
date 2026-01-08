using System.Data;

namespace DistributedApp.Maintenance.Application.Interfaces
{
    public interface ISqlConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}