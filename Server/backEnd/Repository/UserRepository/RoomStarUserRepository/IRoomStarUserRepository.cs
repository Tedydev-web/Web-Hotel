using WebHotel.DTO;
using WebHotel.DTO.RoomStarDtos;

namespace WebHotel.Repository.UserRepository.RoomStarRepository
{
    public interface IRoomStarUserRepository
    {
        Task<StatusDto> Create(RoomStarRequestDto roomStarRequestDto);
    }
}
