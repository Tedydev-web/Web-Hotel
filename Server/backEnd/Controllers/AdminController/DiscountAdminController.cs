using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebHotel.DTO;

using WebHotel.DTO.DiscountDtos;
using WebHotel.Repository.AdminRepository.DiscountRepository;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("v{version:apiVersion}/admin/discount/")]
[ApiVersion("2.0")]
public class DiscountAdminController : ControllerBase
{
    private readonly IDiscountAdminRepository _discountRepository;

    public DiscountAdminController(IDiscountAdminRepository discountRepository)
    {
        _discountRepository = discountRepository;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create(DiscountRequestDto discountRequestDto)
    {
        var email = User.FindFirst(ClaimTypes.Email)!.Value;
        var result = await _discountRepository.Create(discountRequestDto, email);
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
        return Ok(await _discountRepository.GetAll());
    }

    [HttpGet]
    [Route("get-by-id")]
    public async Task<IActionResult> GetById(int? id)
    {
        var result = await _discountRepository.GetById(id);
        if (result != null)
        {
            return Ok(result);
        }
        return BadRequest(new StatusDto { StatusCode = 0, Message = "Id not found" });
    }

    [HttpGet]
    [Route("get-by-search")]
    public IActionResult GetBySearch(
        string? discountCode,
        string? name,
        decimal? percentDiscount,
        DateTime? startAt,
        DateTime? endAt,
        string? nameType,
        string? creatorEmail
    )
    {
        return Ok(
            _discountRepository.GetBySearch(
                discountCode,
                name,
                percentDiscount,
                startAt,
                endAt,
                nameType,
                creatorEmail
            )
        );
    }

    [HttpPost]
    [Route("update")]
    public async Task<IActionResult> Update(int? id, [FromBody] DiscountUpdateDto discountUpdateDto)
    {
        var result = await _discountRepository.Update(id, discountUpdateDto);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpGet]
    [Route("delete")]
    public async Task<IActionResult> Delete([FromQuery] int? id)
    {
        var result = await _discountRepository.Delete(id);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
