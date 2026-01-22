using DistributedApp.Assets.Application.DTOs;
using DistributedApp.Assets.Application.Interfaces;
using DistributedApp.Assets.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace DistributedApp.Assets.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivosController : ControllerBase
{
    private readonly IActivoRepository _repo;
    private readonly ITipoActivoRepository _tipoRepo;

    public ActivosController(IActivoRepository repo, ITipoActivoRepository tipoRepo)
    {
        _repo = repo;
        _tipoRepo = tipoRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync();
        var result = items.Select(x => new ActivoResponse(
            x.IdActivo,
            x.Nombre,
            x.PeriodosDepreciacionTotal,
            x.ValorCompra,
            x.IdTipoActivo,
            x.TipoActivoNombre
        ));
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _repo.GetByIdAsync(id);
        if (item is null) return NotFound();

        return Ok(new ActivoResponse(
            item.IdActivo,
            item.Nombre,
            item.PeriodosDepreciacionTotal,
            item.ValorCompra,
            item.IdTipoActivo,
            item.TipoActivoNombre
        ));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string term)
    {
        term ??= string.Empty;
        var items = await _repo.SearchAsync(term);
        var result = items.Select(x => new ActivoResponse(
            x.IdActivo,
            x.Nombre,
            x.PeriodosDepreciacionTotal,
            x.ValorCompra,
            x.IdTipoActivo,
            x.TipoActivoNombre
        ));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ActivoCreateRequest request)
    {
        var validation = await ValidateActivoRequest(request.Nombre, request.PeriodosDepreciacionTotal, request.ValorCompra, request.IdTipoActivo);
        if (validation is not null) return validation;

        var entity = new Activo
        {
            Nombre = request.Nombre.Trim(),
            PeriodosDepreciacionTotal = request.PeriodosDepreciacionTotal,
            ValorCompra = request.ValorCompra,
            IdTipoActivo = request.IdTipoActivo,
            Activo = true
        };

        var newId = await _repo.CreateAsync(entity);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { Id = newId, Message = "Activo creado" });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ActivoUpdateRequest request)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return NotFound();

        var validation = await ValidateActivoRequest(request.Nombre, request.PeriodosDepreciacionTotal, request.ValorCompra, request.IdTipoActivo);
        if (validation is not null) return validation;

        existing.Nombre = request.Nombre.Trim();
        existing.PeriodosDepreciacionTotal = request.PeriodosDepreciacionTotal;
        existing.ValorCompra = request.ValorCompra;
        existing.IdTipoActivo = request.IdTipoActivo;

        var ok = await _repo.UpdateAsync(existing);
        return ok ? Ok(new { Message = "Activo actualizado" }) : StatusCode(500, new { Message = "No se pudo actualizar" });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok ? Ok(new { Message = "Activo eliminado" }) : NotFound();
    }

    private async Task<IActionResult?> ValidateActivoRequest(string nombre, int periodosTotal, decimal valorCompra, int idTipoActivo)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            return BadRequest(new { Message = "El nombre es obligatorio" });
        if (periodosTotal <= 0)
            return BadRequest(new { Message = "Los periodos de depreciación deben ser mayores a 0" });
        if (valorCompra <= 0)
            return BadRequest(new { Message = "El valor de compra debe ser mayor a 0" });

        var tipo = await _tipoRepo.GetByIdAsync(idTipoActivo);
        if (tipo is null || !tipo.Activo)
            return BadRequest(new { Message = "El Tipo de Activo no existe" });

        return null;
    }
}
