using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Auth.Domain.Entities
{
    public class Usuario
    {
        public int IdUsuario { get; set; } // En BD es IdUsuario (PK)
        public string NombreUsuario { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty; // 'ADMIN' o 'USER'
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
