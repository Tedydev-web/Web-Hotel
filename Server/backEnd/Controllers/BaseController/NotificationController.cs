using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebHotel.DTO;

namespace WebHotel.Controllers.BaseController
{
    [ApiController]
    [ApiVersion("3.0")]
    [Route("v{version:apiVersion}/notification/")]
    public class NotificationController : ControllerBase
    {
        private readonly MyDBContext _context;
        private readonly IMapper _mapper;

        public NotificationController(MyDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("delete-by-id")]
        public async Task<IActionResult> DeleteById(int id)
        {
            var result = await _context.Notifications.SingleOrDefaultAsync(x => x.Id == id);
            if (result == null)
            {
                return BadRequest(new StatusDto { StatusCode = 0, Message = "Id not found" });
            }
            _context.Remove(result);
            await _context.SaveChangesAsync();
            return Ok(new StatusDto { StatusCode = 1, Message = "Delete notification successful" });
        }

        [HttpGet("delete-all")]
        public async Task<IActionResult> DeleteAll()
        {
            var email = User.Claims.FirstOrDefault(a => a.Type == ClaimTypes.Email)!.Value;
            var user = await _context.ApplicationUsers.SingleOrDefaultAsync(a => a.Email == email);
            var result = _context.Notifications.Where(a => a.UserId == user!.Id);
            if (result == null)
            {
                return BadRequest(new StatusDto { StatusCode = 0, Message = "Id not found" });
            }
            _context.RemoveRange(result);
            await _context.SaveChangesAsync();
            return Ok(new StatusDto { StatusCode = 1, Message = "Delete notification successful" });
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(NotificationCreateDto notificationCreate)
        {
            try
            {
                var result = _mapper.Map<Notification>(notificationCreate);
                await _context.AddAsync(result);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message });
            }
            return Ok(new StatusDto { StatusCode = 1, Message = "Created successfully" });
        }
    }
}
