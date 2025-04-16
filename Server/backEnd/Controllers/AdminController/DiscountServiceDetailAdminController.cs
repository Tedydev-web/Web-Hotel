using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebHotel.DTO.DiscountServiceDetailDtos;
using WebHotel.Repository.AdminRepository.DiscountServiceDetailAdminRepository;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("v{version:apiVersion}/admin/discount-service-detail/")]
[ApiVersion("2.0")]
public class DiscountServiceDetailAdminController : ControllerBase
{
    private readonly IDiscountServiceDetailAdminRepository _discountServiceDetailRepository;

    public DiscountServiceDetailAdminController(IDiscountServiceDetailAdminRepository discountServiceDetailRepository)
    {
        _discountServiceDetailRepository = discountServiceDetailRepository;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create(DiscountServiceDetailRequest discountServiceDetailRequest)
    {
        var email = User.FindFirst(ClaimTypes.Email)!.Value;
        var result = await _discountServiceDetailRepository.Create(discountServiceDetailRequest, email);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
