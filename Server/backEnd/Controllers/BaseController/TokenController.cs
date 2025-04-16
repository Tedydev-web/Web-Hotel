using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO;
using WebHotel.DTO.TokenDtos;
using WebHotel.Service.TokenRepository;

namespace WebHotel.Controllers.BaseController;

[ApiController]
[ApiVersion("3.0")]
[Route("v{version:apiVersion}/token/")]
public class TokenController : ControllerBase
{
    private readonly ITokenRepository _service;

    public TokenController(ITokenRepository service)
    {
        _service = service;
    }

    [HttpPost]
    [Route("refresh")]
    public IActionResult Refresh(TokenRequestDto tokenRequest)
    {
        var token = _service.RefreshToken(tokenRequest);
        if (token is StatusDto)
        {
            return BadRequest(token);
        }
        return Ok(token);
    }

    [HttpPost]
    [Route("revoke")]
    [Authorize]
    public IActionResult Revoke(TokenRequestDto tokenRequest)
    {
        bool check = _service.Revoke(tokenRequest);
        if (!check)
        {
            return BadRequest();
        }
        return Ok();
    }
}
