using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO;
using WebHotel.DTO.AuthenticationDtos;

namespace WebHotel.Repository.AdminRepository.AuthenRepository
{
    public interface IAuthenAdminRepository
    {
        Task<object> Login([FromBody] LoginDto model);
        Task<StatusDto> RegistrationAdmin([FromBody] RegisterAdminDto model);
        Task<StatusDto> RegistrationEmployee([FromBody] RegisterAdminDto model);
        Task<StatusDto> RequestChangePassword(ForgotPasswordDto forgotPasswordModel);
        Task<StatusDto> ConfirmChangePassword(ResetPasswordDto resetPasswordModel);
    }
}
