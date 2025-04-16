using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO;
using WebHotel.DTO.AuthenticationDtos;
using WebHotel.Repository.UserRepository.AuthenRepository;

namespace WebHotel.Controllers.UserController;

[ApiController]
[ApiVersion("1.0")]
[Route("user/")]
public class AuthenUserController : ControllerBase
{
    private readonly IAuthenUserRepository _authenUserRepository;

    public AuthenUserController(IAuthenUserRepository authenUserRepository)
    {
        _authenUserRepository = authenUserRepository;
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var result = await _authenUserRepository.Login(model);
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
    [Route("register")]
    public async Task<IActionResult> Registration([FromBody] RegisterDto model)
    {
        StatusDto result = await _authenUserRepository.Registration(model);
        if (result.StatusCode == 1)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    [HttpGet]
    [Route("request-reset-password")]
    public async Task<IActionResult> RequestResetPassword(string? email)
    {
        var status = await _authenUserRepository.RequestResetPassword(email);
        if (status.StatusCode == 1)
        {
            return Ok(status);

        }
        return BadRequest(status);
    }

    [HttpGet]
    [Route("confirm-email-register")]
    public async Task<IActionResult> ConfirmEmailRegister(string email, string code)
    {
        var result = await _authenUserRepository.ConfirmEmailRegister(email, code);
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
        var status = await _authenUserRepository.RequestChangePassword(forgotPasswordModel);
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
        var status = await _authenUserRepository.ConfirmChangePassword(resetPasswordModel);
        if (ModelState.IsValid && status.StatusCode == 1)
        {
            return Ok(status);
        }
        else
        {
            return BadRequest(status);
        }
    }

    [HttpPost]
    [Route("change-pass-logged-in")]
    public async Task<IActionResult> ChangePassLoggedIn(ChangePassLoggedInRequestDto changePassLoggedInRequestDto)
    {
        var status = await _authenUserRepository.ChangePassLoggedIn(changePassLoggedInRequestDto);
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
