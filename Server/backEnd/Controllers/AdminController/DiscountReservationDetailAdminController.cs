using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebHotel.DTO.DiscountReservationDetailDtos;
using WebHotel.Repository.AdminRepository.DiscountReservationDetailAdminRepository;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("v{version:apiVersion}/admin/discount-reservation-detail/")]
[ApiVersion("2.0")]
public class DiscountReservationDetailAdminController : ControllerBase
{
    private readonly IDiscountReservationDetailAdminRepository _discountReservationDetailAdminRepository;

    public DiscountReservationDetailAdminController(IDiscountReservationDetailAdminRepository discountReservationDetailAdminRepository)
    {
        _discountReservationDetailAdminRepository = discountReservationDetailAdminRepository;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create(DiscountReservationDetailRequest discountReservationDetailRequest)
    {
        var email = User.FindFirst(ClaimTypes.Email)!.Value;
        var result = await _discountReservationDetailAdminRepository.Create(discountReservationDetailRequest, email);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
