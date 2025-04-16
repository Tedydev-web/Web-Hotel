using WebHotel.DTO;
using WebHotel.DTO.UserDtos;

namespace WebHotel.Repository.UserRepository.UserProfileRepository
{
    public interface IUserProfileRepository
    {
        Task<StatusDto> Update(UserProfileRequestDto user, string? email);
        UserProfileResponseDto Get(string? email);
    }
}
