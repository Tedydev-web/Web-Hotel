using Database.Data;
using Database.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Web;
using WebHotel.Commom;
using WebHotel.DTO;
using WebHotel.DTO.AuthenticationDtos;
using WebHotel.Service.EmailRepository;
using WebHotel.Service.TokenRepository;

namespace WebHotel.Repository.UserRepository.AuthenRepository;

public class AuthenUserRepository : ControllerBase, IAuthenUserRepository
{
    private readonly MyDBContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ITokenRepository _tokenService;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IMailService _mailService;
    private readonly IConfiguration _configuration;

    public AuthenUserRepository(
        MyDBContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ITokenRepository tokenService,
        SignInManager<ApplicationUser> signInManager,
        IMailService mailService,
        IConfiguration configuration
    )
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
        _signInManager = signInManager;
        _mailService = mailService;
        _configuration = configuration;
    }

    public async Task<object> Login([FromBody] LoginDto model)
    {
        var user = _context.ApplicationUsers.SingleOrDefault(
            a => a.Email == model.Email || a.UserName == model.Email
        );

        if (user != null)
        {
            if (user.LockoutEnd >= DateTime.UtcNow)
            {
                return new StatusDto
                {
                    StatusCode = 0,
                    Message =
                        "Account has been locked because of wrong input 3 times! Unlocking times are: "
                        + user.LockoutEnd.Value.AddHours(7),
                };
            }
            var check = await _signInManager.PasswordSignInAsync(
                user,
                model.Password!,
                false,
                true
            );

            if (check.Succeeded)
            {
                var userRoles = await _userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName!),
                    new Claim(ClaimTypes.Email, user.Email!),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                var token = _tokenService.GetAccessToken(authClaims);
                var refreshToken = _tokenService.GetRefreshToken();
                var tokenInfo = _context.TokenInfos.FirstOrDefault(a => a.Usename == user.UserName);

                if (tokenInfo == null)
                {
                    var info = new TokenInfo
                    {
                        Usename = user.UserName,
                        RefreshToken = refreshToken,
                        RefreshTokenExpiry = DateTime.Now.AddDays(1)
                    };
                    await _context.TokenInfos.AddAsync(info);
                }
                else
                {
                    tokenInfo.RefreshToken = refreshToken;
                    tokenInfo.RefreshTokenExpiry = DateTime.Now.AddDays(1);
                }
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    return new StatusDto { StatusCode = 0, Message = ex.Message, };
                }

                return new LoginResponseDto
                {
                    AccessToken = token.TokenString,
                    RefreshToken = refreshToken,
                };
            }
        }
        return new StatusDto { StatusCode = 0, Message = "Wrong account or password!", };
    }

    public async Task<StatusDto> Registration([FromBody] RegisterDto model)
    {
        var status = new StatusDto();
        if (!ModelState.IsValid)
        {
            status.StatusCode = 0;
            status.Message = "Please complete registration information";
            return status;
        }
        // check if user exists
        var userExistsEmail = await _userManager.FindByEmailAsync(model.Email!);
        var userExistsUserName = await _userManager.FindByNameAsync(model.UserName!);

        if (userExistsEmail != null)
        {
            status.StatusCode = 0;
            status.Message = "Email already exists in the system";
            return status;
        }
        if (userExistsUserName != null)
        {
            status.StatusCode = 0;
            status.Message = "UseName already exists in the system";
            return status;
        }

        var user = new ApplicationUser
        {
            UserName = model.UserName,
            //SecurityStamp = Guid.NewGuid().ToString(),
            Email = model.Email,
            Name = model.Name!,
            PhoneNumber = model.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, model.Password!);

        if (!result.Succeeded)
        {
            status.StatusCode = 0;
            status.Message = "There was an error during account creation, please try again!";
            return status;
        }

        if (!await _roleManager.RoleExistsAsync(UserRoles.User))
            await _roleManager.CreateAsync(new ApplicationRole(UserRoles.User));

        if (await _roleManager.RoleExistsAsync(UserRoles.User))
        {
            await _userManager.AddToRoleAsync(user, UserRoles.User);
        }

        string codeBase = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        string code = HttpUtility.UrlEncode(codeBase);

        var param = new Dictionary<string, string?> { { "email", model.Email }, { "code", code } };
        string callBack = QueryHelpers.AddQueryString(
            _configuration["URL_FRONT_END"]!.ToString() + "/confirm-register",
            param
        );

        if (
            _mailService.SendMail(
                new EmailRequestDto
                {
                    To = user.Email,
                    Subject = "Mail confim registed",
                    Body = "<a href=\"" + callBack + "\">Link Confim</a>"
                }
            )
        )
        {
            status.StatusCode = 1;
            status.Message =
                "Successfully created new account. Please check your email to activate your account!";
        }
        else
        {
            status.StatusCode = 0;
            status.Message = "Create new account successfully, but send email failed";
        }

        return status;
    }

    public async Task<StatusDto> ConfirmEmailRegister(string email, string code)
    {
        var user = await _userManager.FindByEmailAsync(email!);
        if (user != null)
        {
            if (user.EmailConfirmed == false)
            {
                var result = await _userManager.ConfirmEmailAsync(user, code);
                if (result.Succeeded == true)
                {
                    return new StatusDto { StatusCode = 1, Message = "Confirm successfully" };
                }
                return new StatusDto { StatusCode = 0, Message = "Token has expired" };
            }
            else
            {
                return new StatusDto { StatusCode = 0, Message = "The account has been activated" };
            }
        }
        return new StatusDto { StatusCode = 0, Message = "Email not exists" };
    }

    public async Task<StatusDto> RegistrationAdmin([FromBody] RegisterAdminDto model)
    {
        var status = new StatusDto();
        var userExists = _context.ApplicationUsers
            .AsNoTracking()
            .Where(a => a.Email == model.Email || a.UserName == model.UserName)
            .SingleOrDefault();
        if (userExists != null)
        {
            status.StatusCode = 0;
            status.Message = "Invalid email or username";
            return status;
        }
        var user = new ApplicationUser
        {
            UserName = model.UserName,
            SecurityStamp = Guid.NewGuid().ToString(),
            Email = model.Email,
            EmailConfirmed = true
        };
        // create a user here
        var result = await _userManager.CreateAsync(user, model.Password!);
        if (!result.Succeeded)
        {
            status.StatusCode = 0;
            status.Message = "Admin creation failed";
            return status;
        }

        if (!await _roleManager.RoleExistsAsync(UserRoles.Admin))
            await _roleManager.CreateAsync(new ApplicationRole(UserRoles.Admin));

        if (await _roleManager.RoleExistsAsync(UserRoles.Admin))
        {
            await _userManager.AddToRoleAsync(user, UserRoles.Admin);
        }
        status.StatusCode = 1;
        status.Message = "Sucessfully admin registered";
        return status;
    }

    public async Task<StatusDto> RequestResetPassword(string? email)
    {
        var status = new StatusDto();
        var user = await _userManager.FindByEmailAsync(email!);
        if (user is not null)
        {
            const string chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789";
            Random random = new Random();
            IEnumerable<string> string_Enumerable = Enumerable.Repeat(chars, 8);
            char[] arr = string_Enumerable.Select(s => s[random.Next(s.Length)]).ToArray();
            var password = "@T" + string.Join("", arr);

            await _userManager.RemovePasswordAsync(user);
            var check = await _userManager.AddPasswordAsync(user, password);

            if (check.Succeeded)
            {
                _mailService.SendMail(
                    new EmailRequestDto
                    {
                        To = user.Email,
                        Subject = "Mail reset account password!",
                        Body =
                            "Chào bạn, "
                            + user.Name
                            + "! Your new password is: "
                            + password
                            + ". Please do not change your password after logging in!"
                    }
                );
                status.StatusCode = 1;
                status.Message = "Please check the test box to get a new password!";
                return status;
            }
            else
            {
                status.StatusCode = 0;
                status.Message =
                    "There was an error during resetting the new password! Please try again!";
            }
        }
        status.StatusCode = 0;
        status.Message = "Email does not exist in the system!";
        return status;
    }

    public async Task<StatusDto> RequestChangePassword(ForgotPasswordDto forgotPasswordModel)
    {
        var user = await _userManager.FindByEmailAsync(forgotPasswordModel.Email!);
        if (user is null)
        {
            return new StatusDto { StatusCode = 0, Message = "Email does not exist" };
        }
        string token = HttpUtility.UrlEncode(
            await _userManager.GeneratePasswordResetTokenAsync(user)
        );
        var param = new Dictionary<string, string?>
        {
            { "token", token },
            { "email", forgotPasswordModel.Email }
        };
        var callBack = QueryHelpers.AddQueryString(forgotPasswordModel.ClientURI!, param);
        _mailService.SendMail(
            new EmailRequestDto
            {
                To = user.Email,
                Subject = "Mail confim change pass",
                Body = "Change password link: <a href=\"" + callBack + "\">Click Confirm</a>"
            }
        );
        return new StatusDto { StatusCode = 1, Message = "Please check mail to change pass" };
    }

    public async Task<StatusDto> ConfirmChangePassword(ResetPasswordDto resetPasswordModel)
    {
        var user = await _userManager.FindByEmailAsync(resetPasswordModel.Email!);
        if (user != null)
        {
            var check = await _userManager.ResetPasswordAsync(
                user!,
                HttpUtility.UrlDecode(resetPasswordModel.Token),
                resetPasswordModel.NewPassword!
            );
            if (check.Succeeded)
            {
                return new StatusDto { StatusCode = 1, Message = "Change pass successfull" };
            }
            return new StatusDto { StatusCode = 0, Message = "Change pass failed" };
        }
        return new StatusDto { StatusCode = 0, Message = "Email not found" };
    }

    public async Task<StatusDto> ChangePassLoggedIn(
        ChangePassLoggedInRequestDto changePassLoggedInRequestDto
    )
    {
        var user = await _context.ApplicationUsers.SingleOrDefaultAsync(
            a => a.Email == changePassLoggedInRequestDto.Email
        );
        if (user is not null)
        {
            var changePass = await _userManager.ChangePasswordAsync(
                user,
                changePassLoggedInRequestDto.CurrentPassword,
                changePassLoggedInRequestDto.NewPassword
            );
            if (changePass.Succeeded)
            {
                return new StatusDto { StatusCode = 1, Message = "Changed password successfully!" };
            }
            return new StatusDto { StatusCode = 0, Message = "Changed password error!" };
        }
        return new StatusDto { StatusCode = 0, Message = "Email not found!" };
    }
}
