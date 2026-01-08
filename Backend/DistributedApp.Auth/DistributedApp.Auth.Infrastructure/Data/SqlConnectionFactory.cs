using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using DistributedApp.Auth.Application.Interfaces;

namespace DistributedApp.Auth.Infrastructure.Data
{
    public class SqlConnectionFactory : ISqlConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public SqlConnectionFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateConnection()
        {
            return new SqlConnection(_configuration.GetConnectionString("BeaconDesk-AzureDatabase"));
        }
    }
}