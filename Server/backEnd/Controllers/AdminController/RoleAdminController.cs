using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using WebHotel.DTO;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/role/")]
//[Authorize(Roles = "Admin")]
public class RoleAdminController : ControllerBase
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public RoleAdminController(MyDBContext context, IMapper mapper, RoleManager<ApplicationRole> roleManager, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create(RoleCreateDto roleCreate)
    {
        if (await _roleManager.RoleExistsAsync(roleCreate.Name))
        {
            return BadRequest(new StatusDto { StatusCode = 0, Message = "Role is exists" });
        }
        await _roleManager.CreateAsync(new ApplicationRole(roleCreate.Name!));
        return Ok(new StatusDto { StatusCode = 1, Message = "Created successfully" });
    }

    [HttpGet("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _context.ApplicationRoles.ToListAsync();
        if (roles.Count == 0)
        {
            return NotFound();
        }
        return Ok(_mapper.Map<List<RoleResponseDto>>(roles));
    }

    [HttpPost("add-role")]
    public async Task<IActionResult> AddRole(RoleAddDto roleAdd)
    {
        var user = await _context.ApplicationUsers.SingleOrDefaultAsync(a => a.Id == roleAdd.AccountId);
        if (user == null)
        {
            return BadRequest(new StatusDto { StatusCode = 0, Message = "Account Id is not valid" });
        }
        try
        {
            await _userManager.AddToRolesAsync(user, roleAdd.Roles);
            return Ok(new StatusDto { StatusCode = 1, Message = "Add role successful" });
        }
        catch (Exception ex)
        {
            return BadRequest(new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message });
        }
    }

}
public class RoleCreateDto
{
    public string? Name { get; set; }
}

public class RoleResponseDto
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? NormalizedName { get; set; }
}

public class RoleAddDto
{
    [Required(ErrorMessage = "{0} is required")]
    public string? AccountId { get; set; }
    [Required(ErrorMessage = "{0} is required")]
    public List<string>? Roles { get; set; }
}
