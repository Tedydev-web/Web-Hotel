using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO.RoomStarDtos;
using WebHotel.Repository.UserRepository.RoomStarRepository;

namespace WebHotel.Controllers.UserController;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("user/")]
public class RoomStarUserController : ControllerBase
{
    private readonly IRoomStarUserRepository _roomStarRepository;

    public RoomStarUserController(IRoomStarUserRepository roomStarRepository)
    {
        _roomStarRepository = roomStarRepository;
    }

    [HttpPost]
    [Route("room-star/create")]
    public async Task<IActionResult> Create(RoomStarRequestDto roomStarRequestDto)
    {
        var result = await _roomStarRepository.Create(roomStarRequestDto);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
