using DistributedApp.Auth.Application.DTOs;
using DistributedApp.Auth.Application.Interface;
using DistributedApp.Auth.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Auth.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuariosController(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        // GET: api/usuarios
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var usuarios = await _usuarioRepository.GetAllAsync();
            return Ok(usuarios);
        }

        // POST: api/usuarios/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usuario = await _usuarioRepository.GetByUsernameAsync(request.Username);

            if (usuario == null)
            {
                return Unauthorized(new { Message = "Usuario no encontrado" });
            }

            if (usuario.Contrasena != request.Password)
            {
                return Unauthorized(new { Message = "Contraseña incorrecta" });
            }

            return Ok(new
            {
                Message = "Login Exitoso",
                UsuarioId = usuario.IdUsuario,
                Nombre = usuario.NombreCompleto,
                Rol = usuario.Rol
            });
        }

        // POST: api/usuarios
        // Crea un nuevo usuario
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Usuario usuario)
        {
            try
            {
                if (string.IsNullOrEmpty(usuario.Rol)) usuario.Rol = "USER";
                usuario.Activo = true;
                
                // Si la fecha viene nula, ponemos la actual (aunque la BD lo haga, es bueno asegurarlo)
                if (usuario.FechaCreacion == default) usuario.FechaCreacion = DateTime.Now;

                var nuevoId = await _usuarioRepository.CreateAsync(usuario);

                return CreatedAtAction(nameof(GetAll), new { id = nuevoId }, new { Id = nuevoId, Message = "Usuario Creado" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // --- NUEVOS ENDPOINTS AGREGADOS ---

        // PUT: api/usuarios/{id}
        // Actualiza un usuario existente
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Usuario usuario)
        {
            try
            {
                if (id != usuario.IdUsuario)
                {
                    return BadRequest(new { Message = "El ID de la URL no coincide con el cuerpo de la solicitud" });
                }

                // Llamamos al repositorio para actualizar
                // Nota: Tu repositorio debe manejar la lógica de si la contraseña viene nula o vacía para no sobrescribirla
                var resultado = await _usuarioRepository.UpdateAsync(usuario);

                if (!resultado)
                {
                    return NotFound(new { Message = "Usuario no encontrado o no se pudo actualizar" });
                }

                return Ok(new { Message = "Usuario actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // DELETE: api/usuarios/{id}
        // Elimina un usuario por ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var resultado = await _usuarioRepository.DeleteAsync(id);

                if (!resultado)
                {
                    return NotFound(new { Message = "Usuario no encontrado" });
                }

                return Ok(new { Message = "Usuario eliminado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // PATCH: api/usuarios/{id}/estado
        // Actualiza solo el estado (Activo/Inactivo)
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> ToggleStatus(int id, [FromBody] EstadoRequest request)
        {
            try
            {
                // Asumimos que tienes un método específico para esto, o usamos UpdateAsync parcial
                var resultado = await _usuarioRepository.UpdateStatusAsync(id, request.Activo);

                if (!resultado)
                {
                    return NotFound(new { Message = "Usuario no encontrado" });
                }

                return Ok(new { Message = "Estado actualizado correctamente", NuevoEstado = request.Activo });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

    // DTO auxiliar para el cambio de estado (puedes ponerlo en otro archivo si prefieres)
    public class EstadoRequest
    {
        public bool Activo { get; set; }
    }
}