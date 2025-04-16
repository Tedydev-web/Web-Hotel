using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebHotel.DTO.DiscountRoomDetailDtos;
using WebHotel.Repository.AdminRepository.DiscountRoomDetailAdminRepository;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("v{version:apiVersion}/admin/discount-room-detail/")]
[ApiVersion("2.0")]
public class DiscountRoomDetailAdminController : ControllerBase
{
    private readonly IDiscountRoomDetailAdminRepository _discountRoomDetailRepository;

    public DiscountRoomDetailAdminController(IDiscountRoomDetailAdminRepository discountRoomDetailRepository)
    {
        _discountRoomDetailRepository = discountRoomDetailRepository;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create(DiscountRoomDetailRequest discountRoomDetailRequest)
    {
        var email = User.FindFirst(ClaimTypes.Email)!.Value;
        var result = await _discountRoomDetailRepository.Create(discountRoomDetailRequest, email);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
