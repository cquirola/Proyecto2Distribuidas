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
        // Obtiene todos los usuarios activos
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var usuarios = await _usuarioRepository.GetAllAsync();
            return Ok(usuarios);
        }

        // POST: api/usuarios/login
        // Valida credenciales (Paso previo a generar el Token OAuth)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Buscar usuario por nombre
            var usuario = await _usuarioRepository.GetByUsernameAsync(request.Username);

            if (usuario == null)
            {
                return Unauthorized(new { Message = "Usuario no encontrado" });
            }

            // 2. Validar contraseña (Texto plano según requerimiento actual)
            if (usuario.Contrasena != request.Password)
            {
                return Unauthorized(new { Message = "Contraseña incorrecta" });
            }

            // 3. Si todo está bien, retornamos el usuario (sin la contraseña por seguridad)
            // NOTA: Aquí es donde más adelante generaremos el JWT Token.
            return Ok(new
            {
                Message = "Login Exitoso",
                UsuarioId = usuario.IdUsuario,
                Nombre = usuario.NombreCompleto,
                Rol = usuario.Rol
            });
        }

        // POST: api/usuarios
        // Crea un nuevo usuario (Para probar el Insert con Dapper)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Usuario usuario)
        {
            try
            {
                // Forzamos valores por defecto si vienen nulos
                if (string.IsNullOrEmpty(usuario.Rol)) usuario.Rol = "USER";
                usuario.Activo = true;

                var nuevoId = await _usuarioRepository.CreateAsync(usuario);

                return CreatedAtAction(nameof(GetAll), new { id = nuevoId }, new { Id = nuevoId, Message = "Usuario Creado" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
