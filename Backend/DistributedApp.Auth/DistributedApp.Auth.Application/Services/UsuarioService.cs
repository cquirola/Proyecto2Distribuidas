using DistributedApp.Auth.Application.DTOs;
using DistributedApp.Auth.Application.Interface;
using DistributedApp.Auth.Domain.Entities;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DistributedApp.Auth.Application.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IConfiguration _configuration; // Necesario para leer el appsettings

        public UsuarioService(IUsuarioRepository usuarioRepository, IConfiguration configuration)
        {
            _usuarioRepository = usuarioRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> AuthenticateAsync(LoginRequest request)
        {
            // 1. Buscamos el usuario
            var usuario = await _usuarioRepository.GetByUsernameAsync(request.Username);

            // 2. Validaciones (Usuario existe y contraseña coincide)
            if (usuario == null || usuario.Contrasena != request.Password)
            {
                return null; // O podrías lanzar una excepción personalizada
            }

            // 3. GENERAR JWT
            var tokenString = GenerarTokenJwt(usuario);

            // 4. Retornar respuesta
            return new AuthResponseDto
            {
                UsuarioId = usuario.IdUsuario,
                Nombre = usuario.NombreCompleto,
                Rol = usuario.Rol,
                Token = tokenString
            };
        }

        public async Task<Usuario> CreateAsync(Usuario usuario)
        {
            // Lógica de Negocio movida desde el Controller
            if (string.IsNullOrEmpty(usuario.Rol)) usuario.Rol = "USER";
            usuario.Activo = true;
            if (usuario.FechaCreacion == default) usuario.FechaCreacion = DateTime.Now;

            // Aquí podrías agregar lógica para hashear la contraseña antes de guardar
            // usuario.Contrasena = HashPassword(usuario.Contrasena); 

            var id = await _usuarioRepository.CreateAsync(usuario);
            usuario.IdUsuario = id;
            return usuario;
        }

        // --- Métodos Passthrough (Pasan directo al repo) ---
        public async Task<IEnumerable<Usuario>> GetAllAsync() => await _usuarioRepository.GetAllAsync();
        public async Task<Usuario?> GetByIdAsync(int id) => await _usuarioRepository.GetByIdAsync(id);
        public async Task<bool> DeleteAsync(int id) => await _usuarioRepository.DeleteAsync(id);
        public async Task<bool> UpdateStatusAsync(int id, bool activo) => await _usuarioRepository.UpdateStatusAsync(id, activo);

        public async Task<bool> UpdateAsync(int id, Usuario usuario)
        {
            if (id != usuario.IdUsuario) return false;
            return await _usuarioRepository.UpdateAsync(usuario);
        }

        public async Task<AuthResponseDto> AuthenticateGoogleAsync(string googleCredential)
        {
            try
            {
                // 1. Validar el token con Google
                var settings = new GoogleJsonWebSignature.ValidationSettings();
                var payload = await GoogleJsonWebSignature.ValidateAsync(googleCredential, settings);

                // payload.Email -> Correo verificado de Google
                // payload.Name  -> Nombre completo de Google

                // 2. Buscar usuario en nuestra BD usando el CORREO (que es único en Google)
                var usuario = await _usuarioRepository.GetByCorreoAsync(payload.Email);

                // Si no existe el método GetByCorreoAsync, podrías usar GetByUsernameAsync(payload.Email) 
                // SOLO SI asumes que NombreUsuario siempre es igual al Correo. 
                // Pero lo ideal es usar el campo Correo.

                if (usuario == null)
                {
                    // 3. Auto-Registro: Creamos el usuario si es nuevo
                    usuario = new Usuario
                    {
                        // Mapeo a TUS propiedades exactas:
                        NombreCompleto = payload.Name,
                        Correo = payload.Email,

                        // Como NombreUsuario es obligatorio, usamos el email por defecto
                        NombreUsuario = payload.Email,

                        Contrasena = "", // Se queda vacía porque entra por OAuth
                        Rol = "USER",    // Rol por defecto
                        Activo = true,
                        FechaCreacion = DateTime.Now
                    };

                    // Guardamos en BD
                    var nuevoId = await _usuarioRepository.CreateAsync(usuario);
                    usuario.IdUsuario = nuevoId;
                }
                else
                {
                    // Opcional: Si el usuario existe pero estaba inactivo, rebotarlo
                    if (!usuario.Activo) return null;
                }

                // 4. Generar NUESTRO JWT (Reutilizamos tu lógica existente)
                // Nota: Asegúrate que tu método GenerarTokenJwt use usuario.IdUsuario y usuario.NombreUsuario
                var tokenString = GenerarTokenJwt(usuario);

                return new AuthResponseDto
                {
                    UsuarioId = usuario.IdUsuario,
                    Nombre = usuario.NombreCompleto,
                    Rol = usuario.Rol,
                    Token = tokenString
                };
            }
            catch (InvalidJwtException)
            {
                // Token inválido o expirado
                return null!;
            }
        }

        // --- MÉTODO PRIVADO PARA GENERAR EL TOKEN ---
        private string GenerarTokenJwt(Usuario usuario)
        {
            // Clave secreta desde appsettings
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Claims (Datos que viajan dentro del token)
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                new Claim(ClaimTypes.Name, usuario.NombreCompleto), // O username
                new Claim(ClaimTypes.Role, usuario.Rol)
            };

            // Configuración del Token
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8), // El token vive 8 horas
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}