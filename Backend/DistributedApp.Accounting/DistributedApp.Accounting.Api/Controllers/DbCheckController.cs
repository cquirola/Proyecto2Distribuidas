using Dapper;
using DistributedApp.Accounting.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Auth.Accounting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DbCheckController : ControllerBase
    {
        private readonly ISqlConnectionFactory _sqlConnectionFactory;

        public DbCheckController(ISqlConnectionFactory sqlConnectionFactory)
        {
            _sqlConnectionFactory = sqlConnectionFactory;
        }

        [HttpGet]
        public async Task<IActionResult> CheckConnection()
        {
            try
            {
                using var connection = _sqlConnectionFactory.CreateConnection();
                // Consulta simple que no requiere tablas
                var serverTime = await connection.QueryFirstAsync<DateTime>("SELECT GETDATE()");

                return Ok(new
                {
                    Status = "Conectado",
                    ServerTime = serverTime,
                    Message = "Dapper y Azure SQL están hablando correctamente."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Error = ex.Message });
            }
        }
    }
}