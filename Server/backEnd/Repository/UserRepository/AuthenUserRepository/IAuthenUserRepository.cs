using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO;
using WebHotel.DTO.AuthenticationDtos;

namespace WebHotel.Repository.UserRepository.AuthenRepository
{
    public interface IAuthenUserRepository
    {
        //Login
        Task<object> Login([FromBody] LoginDto model);
        //Register and send mail confirm
        Task<StatusDto> Registration([FromBody] RegisterDto model);
        //Register with admin
        Task<StatusDto> RegistrationAdmin([FromBody] RegisterAdminDto model);
        //Confirm successful registration by mail
        Task<StatusDto> ConfirmEmailRegister(string email, string code);
        // Confirm successful change pass
        Task<StatusDto> RequestResetPassword(string? email);
        Task<StatusDto> RequestChangePassword(ForgotPasswordDto forgotPasswordModel);
        Task<StatusDto> ConfirmChangePassword(ResetPasswordDto resetPasswordModel);
        Task<StatusDto> ChangePassLoggedIn(ChangePassLoggedInRequestDto changePassLoggedInRequestDto);
    }
}
