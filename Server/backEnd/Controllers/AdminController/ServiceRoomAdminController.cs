using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using WebHotel.DTO;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/service-room/")]
// [Authorize(Roles = "Admin")]
public class ServiceRoomAdminController : ControllerBase
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;

    public ServiceRoomAdminController(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create(ServiceRoomCreateDto serviceRoomCreate)
    {
        var check = await _context.ServiceRooms.AsNoTracking().SingleOrDefaultAsync(a => a.Name == serviceRoomCreate.Name);
        if (check != null)
        {
            return BadRequest(new StatusDto { StatusCode = 0, Message = "Name is unique" });
        }
        await _context.AddAsync(_mapper.Map<ServiceRoom>(serviceRoomCreate));
        await _context.SaveChangesAsync();
        return Ok(new StatusDto { StatusCode = 1, Message = "Created successfully" });
    }

    [HttpGet("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _context.ServiceRooms.AsNoTracking().ToListAsync();
        if (result.Count == 0)
        {
            return NotFound();
        }
        return Ok(_mapper.Map<List<ServiceRoomResponseDto>>(result));
    }

    [HttpGet("delete")]
    public async Task<IActionResult> Delete([FromQuery] int id)
    {
        var result = await _context.ServiceRooms.SingleOrDefaultAsync(a => a.Id == id);
        if (result is null)
        {
            return NotFound();
        }
        _context.Remove(result);
        await _context.SaveChangesAsync();
        return Ok(new StatusDto { StatusCode = 1, Message = "Deleted successfully" });
    }

    [HttpPost("update")]
    public async Task<IActionResult> Update([FromBody] ServiceRoomCreateDto serviceRoom, [FromQuery] int id)
    {
        var result = await _context.ServiceRooms.SingleOrDefaultAsync(a => a.Id == id);
        if (result is null)
        {
            return NotFound();
        }
        _mapper.Map(serviceRoom, result);
        await _context.SaveChangesAsync();
        return Ok(new StatusDto { StatusCode = 1, Message = "Updated successfully" });
    }
}

public class ServiceRoomCreateDto
{
    [Required(ErrorMessage = "{0} is required")]
    public string? Name { get; set; }

    [Required(ErrorMessage = "{0} is required")]
    [Range(0, Int32.MaxValue, ErrorMessage = "Value for {0} must be between {1} and {2}.")]
    public decimal? Price { get; set; }

    [Required(ErrorMessage = "{0} is required")]
    [Range(0, 1000, ErrorMessage = "Value for {0} must be between {1} and {2}.")]
    public int? Amount { get; set; }

    [Required(ErrorMessage = "{0} is required")]
    public string? Picture { get; set; }
}

public class ServiceRoomResponseDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public decimal? Price { get; set; }
    public int? Amount { get; set; }
    public string? Picture { get; set; }
    public decimal? PriceDiscount { get; set; }
}
