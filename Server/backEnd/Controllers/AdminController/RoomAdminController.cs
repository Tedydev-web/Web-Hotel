using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Database.Data;
using WebHotel.DTO.RoomDtos;
using WebHotel.Repository.AdminRepository.RoomRepository;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/room/")]
// [Authorize(Roles = "Admin")]
public class RoomAdminController : ControllerBase
{
    private readonly IRoomAdminRepository _roomAdminRepository;
    private readonly MyDBContext _context;

    public RoomAdminController(IRoomAdminRepository roomAdminRepository, MyDBContext context)
    {
        _roomAdminRepository = roomAdminRepository;
        _context = context;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create([FromForm] RoomRequestDto roomCreateDto)
    {
        var result = await _roomAdminRepository.Create(roomCreateDto);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpGet]
    [Route("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _roomAdminRepository.GetAll();
        return Ok(result);
    }

    [HttpGet]
    [Route("get-by-id")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _roomAdminRepository.GetById(id);
        if (result is not null)
        {
            return Ok(result);
        }
        return BadRequest();
    }

    [HttpGet]
    [Route("get-all-by")]
    public async Task<IActionResult> GetAllBy(DateTime? checkIn, DateTime? checkOut, string? querySearch)
    {
        var result = await _roomAdminRepository.GetAllBy(checkIn, checkOut, querySearch);
        return Ok(result);
    }

    [HttpPost]
    [Route("update")]
    public async Task<IActionResult> Update(string? id, [FromForm] RoomRequestDto roomCreateDto)
    {
        var result = await _roomAdminRepository.Update(id, roomCreateDto);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpGet]
    [Route("delete")]
    public async Task<IActionResult> Delete([FromQuery] string? id)
    {
        var result = await _roomAdminRepository.Delete(id);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpGet]
    [Route("get-available-rooms")]
    public async Task<IActionResult> GetAvailableRooms()
    {
        try
        {
            // Lấy danh sách các ID phòng đang được đặt
            var currentDate = DateTime.Now;
            var bookedRoomIds = await _context.Reservations
                .Where(r => r.EndDate > currentDate) // Chỉ xem xét các đặt phòng chưa kết thúc
                .Select(r => r.RoomId)
                .ToListAsync();

            // Lấy danh sách các phòng không nằm trong danh sách đã đặt
            var availableRooms = await _context.Rooms
                .Include(r => r.RoomType)
                .Where(r => !bookedRoomIds.Contains(r.Id))
                .Select(r => new
                {
                    id = r.Id,
                    roomNumber = r.RoomNumber,
                    name = r.Name,
                    currentPrice = r.CurrentPrice,
                    capacity = r.PeopleNumber,
                    roomType = r.RoomType.TypeName
                })
                .ToListAsync();

            return Ok(availableRooms);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
