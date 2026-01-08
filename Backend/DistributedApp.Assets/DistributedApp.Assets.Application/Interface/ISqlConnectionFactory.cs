using System.Data;

namespace DistributedApp.Assets.Application.Interfaces
{
    public interface ISqlConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}