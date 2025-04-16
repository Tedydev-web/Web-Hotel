using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebHotel.DTO.UserDtos;
using WebHotel.Repository.UserRepository.UserProfileRepository;
using WebHotel.Service.FileService;

namespace WebHotel.Controllers.UserController;

[ApiController]
[Authorize]
[ApiVersion("1.0")]
[Route("user/")]
public class ProfileUserController : ControllerBase
{
    private readonly IUserProfileRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public ProfileUserController(IUserProfileRepository userRepository, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _environment = environment;
    }

    [HttpPost]
    [AllowAnonymous]
    [Route("send-file")]
    public async Task<IActionResult> SendFile(string urlFile, IFormFile formFile)
    {
        FileService a = new FileService(_configuration, _environment);
        await a.SendFile(urlFile, formFile);
        return Ok();
    }

    [HttpGet]
    [AllowAnonymous]
    [Route("delete-file")]
    public async Task<IActionResult> deleteFile(string rootFolder, string fileName)
    {
        FileService a = new FileService(_configuration, _environment);
        await a.deleteFile(rootFolder, fileName);
        return Ok();
    }

    [HttpGet]
    [AllowAnonymous]
    [Route("get-file")]
    public async Task<IActionResult> GetFile(string rootFolder, string fileName)
    {
        FileService a = new FileService(_configuration, _environment);
        var response = await a.GetFile(rootFolder, fileName);
        return Ok(response);
    }

    [HttpPost]
    [Route("user-profile/update")]
    public async Task<IActionResult> Update([FromForm] UserProfileRequestDto _user)
    {
        var emailLogin = User.FindFirst(ClaimTypes.Email)!.Value;

        var status = await _userRepository.Update(_user, emailLogin);
        if (status.StatusCode == 1)
        {
            return Ok(status);
        }
        else
        {
            return BadRequest(status);
        }
    }

    [HttpGet]
    [Route("user-profile/get")]
    public IActionResult Get()
    {
        var email = User.FindFirst(ClaimTypes.Email)!.Value;
        var result = _userRepository.Get(email);
        if (result is null)
        {
            return NotFound();
        }
        return Ok(result);
    }
}