using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO.ServiceAttachDetailDtos;
using WebHotel.Repository.AdminRepository.ServiceAttachDetailRepository;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/service-attach-detail/")]
//[Authorize(Roles = "Admin")]
public class ServiceAttachDetailAdminController : ControllerBase
{
    private readonly IServiceAttachDetailRepository _serviceAttachDetailRepository;

    public ServiceAttachDetailAdminController(IServiceAttachDetailRepository serviceAttachDetailRepository)
    {
        _serviceAttachDetailRepository = serviceAttachDetailRepository;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create([FromBody] ServiceAttachDetailRequestDto serviceAttachDetailDto)
    {
        var result = await _serviceAttachDetailRepository.Create(serviceAttachDetailDto);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpPost]
    [Route("create-list")]
    public async Task<IActionResult> CreateList([FromBody] ServiceAttachDetailRequestDtos serviceAttachDetailRequestDtos)
    {
        var result = await _serviceAttachDetailRepository.CreateList(serviceAttachDetailRequestDtos);
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
        var result = await _serviceAttachDetailRepository.GetAll();
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
        var result = await _serviceAttachDetailRepository.Delete(id);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
