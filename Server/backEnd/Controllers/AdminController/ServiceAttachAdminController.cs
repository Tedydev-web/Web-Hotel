using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO.ServiceAttachDtos;
using WebHotel.Repository.AdminRepository.ServiceAttachRepository;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/service-attach/")]
[Authorize(Roles = "Admin")]
public class ServiceAttachAdminController : ControllerBase
{
    private readonly IServiceAttachAdminRepository _serviceAttachRepository;

    public ServiceAttachAdminController(IServiceAttachAdminRepository serviceAttachRepository)
    {
        _serviceAttachRepository = serviceAttachRepository;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create([FromBody] ServiceAttachRequestDto serviceAttachDto)
    {
        var result = await _serviceAttachRepository.Create(serviceAttachDto);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpPost]
    [Route("update")]
    public async Task<IActionResult> Update([FromBody] ServiceAttachRequestDto serviceAttachDto, [FromQuery] int id)
    {
        var result = await _serviceAttachRepository.Update(serviceAttachDto, id);
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
        var result = await _serviceAttachRepository.GetAll();
        if (result is null)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpGet]
    [Route("delete")]
    public async Task<IActionResult> Delete([FromQuery] int? id)
    {
        var result = await _serviceAttachRepository.Delete(id);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
