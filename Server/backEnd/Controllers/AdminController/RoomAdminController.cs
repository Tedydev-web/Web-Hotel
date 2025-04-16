using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO.RoomDtos;
using WebHotel.Repository.AdminRepository.RoomRepository;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/room/")]
// [Authorize(Roles = "Admin")]
public class RoomAdminController : ControllerBase
{
    private readonly IRoomAdminRepository _roomAdminRepository;
    public RoomAdminController(IRoomAdminRepository roomAdminRepository)
    {
        _roomAdminRepository = roomAdminRepository;
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
}
