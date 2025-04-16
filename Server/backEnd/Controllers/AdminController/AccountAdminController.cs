using AutoMapper;
using Database.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebHotel.Commom;
using WebHotel.DTO.AccountDtos;

namespace WebHotel.Controllers.AdminController;

[ApiController]
//[Authorize(Roles = "Admin")]
[Route("v{version:apiVersion}/admin/account/")]
[ApiVersion("2.0")]
public class AccountAdminController : ControllerBase
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;

    public AccountAdminController(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var accounts = _mapper.Map<List<AccountResponseDto>>(await _context.ApplicationUsers.Include(a => a.UserRoles).ThenInclude(a => a.Role).OrderByDescending(a => a.CreatedAt).ToListAsync());

        return Ok(accounts);
    }

    [HttpGet("get-employee-salary")]
    public async Task<IActionResult> GetEmployeeSalary()
    {
        var employeeId = await _context.ApplicationUserRoles.Include(a => a.Role).Where(a => a.Role!.Name == UserRoles.Employee || a.UserId == UserRoles.Manager).Select(a => a.UserId).ToListAsync();

        var employee = await _context.ApplicationUsers.Where(a => employeeId.Contains(a.Id)).Include(a => a.UserRoles).ThenInclude(a => a.Role).ToListAsync();

        var accounts = _mapper.Map<List<AccountResponseDto>>(employee);

        return Ok(accounts);
    }

    [HttpGet("get-employee")]
    public async Task<IActionResult> GetEmployee()
    {
        var employeeId = await _context.ApplicationUserRoles.Include(a => a.Role).Where(a => a.Role!.Name == UserRoles.Employee).Select(a => a.UserId).ToListAsync();

        var employee = await _context.ApplicationUsers.Where(a => employeeId.Contains(a.Id)).Include(a => a.UserRoles).ThenInclude(a => a.Role).OrderByDescending(a => a.CreatedAt).ToListAsync();

        var accounts = _mapper.Map<List<AccountResponseDto>>(employee);

        return Ok(accounts);
    }

    [HttpGet("get-manager")]
    public async Task<IActionResult> GetManager()
    {
        var managerId = await _context.ApplicationUserRoles.Include(a => a.Role).Where(a => a.Role!.Name == UserRoles.Manager).Select(a => a.UserId).ToListAsync();

        var manager = await _context.ApplicationUsers.Where(a => managerId.Contains(a.Id)).Include(a => a.UserRoles).ThenInclude(a => a.Role).OrderByDescending(a => a.CreatedAt).ToListAsync();

        var accounts = _mapper.Map<List<AccountResponseDto>>(manager);

        return Ok(accounts);
    }

    [HttpGet("get-user")]
    public async Task<IActionResult> GetUser()
    {
        var userId = await _context.ApplicationUserRoles.Include(a => a.Role).Where(a => a.Role!.Name == UserRoles.User).Select(a => a.UserId).ToListAsync();

        var user = await _context.ApplicationUsers.Where(a => userId.Contains(a.Id)).Include(a => a.UserRoles).ThenInclude(a => a.Role).OrderByDescending(a => a.CreatedAt).ToListAsync();

        var accounts = _mapper.Map<List<AccountResponseDto>>(user);

        return Ok(accounts);
    }
}
