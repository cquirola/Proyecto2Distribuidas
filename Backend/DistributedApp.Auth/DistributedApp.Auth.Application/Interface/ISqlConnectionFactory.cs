using System.Data;

namespace DistributedApp.Auth.Application.Interfaces
{
    public interface ISqlConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}