using WebHotel.DTO.RoomDtos;

namespace WebHotel.Repository.UserRepository.RoomUserRepository
{
    public interface IRoomUserRepository
    {
        Task<IEnumerable<RoomResponseDto>> GetAll();
        Task<IEnumerable<RoomResponseDto>> GetAllBy(RoomDataSearchDto roomDataSearchDto);
        Task<RoomResponseDto> GetById(string id);
        Task<IEnumerable<RoomResponseDto>> GetTopNew();
        Task<IEnumerable<RoomResponseDto>> GetTopOnSale();
        Task<RoomSearchDto> GetRoomSearch();
    }
}
