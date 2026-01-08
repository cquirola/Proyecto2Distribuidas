using System.Data;

namespace DistributedApp.Accounting.Application.Interfaces
{
    public interface ISqlConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}