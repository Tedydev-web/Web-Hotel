using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO;
using WebHotel.DTO.AuthenticationDtos;
using WebHotel.Repository.AdminRepository.AuthenRepository;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[Authorize(Roles = "Admin, Employee")]
[Route("v{version:apiVersion}/admin/authen/")]
[ApiVersion("2.0")]
public class AuthenAdminController : ControllerBase
{
    private readonly IAuthenAdminRepository _authenAdminRepository;

    public AuthenAdminController(IAuthenAdminRepository authenAdminRepository)
    {
        _authenAdminRepository = authenAdminRepository;
    }

    [HttpPost]
    [Route("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var result = await _authenAdminRepository.Login(model);
        if (result is LoginResponseDto)
        {
            return Ok(result);
        }
        else
        {
            return BadRequest(result);
        }
    }

    [HttpPost]
    [Route("register-admin")]
    public async Task<IActionResult> RegistrationAdmin([FromBody] RegisterAdminDto model)
    {
        StatusDto result = await _authenAdminRepository.RegistrationAdmin(model);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpPost]
    [Route("register-employee")]
    public async Task<IActionResult> RegistrationEmployee([FromBody] RegisterAdminDto model)
    {
        StatusDto result = await _authenAdminRepository.RegistrationEmployee(model);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpPost]
    [Route("request-change-password")]
    public async Task<IActionResult> RequestChangePassword(ForgotPasswordDto forgotPasswordModel)
    {
        var status = await _authenAdminRepository.RequestChangePassword(forgotPasswordModel);
        if (status.StatusCode == 1)
        {
            return Ok(status);
        }
        return BadRequest(status);
    }
    [HttpPost]
    [Route("confirm-change-password")]
    public async Task<IActionResult> ConfirmChangePassword(ResetPasswordDto resetPasswordModel)
    {
        var status = await _authenAdminRepository.ConfirmChangePassword(resetPasswordModel);
        if (ModelState.IsValid && status.StatusCode == 1)
        {
            return Ok(status);
        }
        else
        {
            return BadRequest(status);
        }
    }
}
