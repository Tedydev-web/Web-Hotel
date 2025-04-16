using WebHotel.DTO;
using WebHotel.DTO.RoomDtos;

namespace WebHotel.Repository.AdminRepository.RoomRepository
{
    public interface IRoomAdminRepository
    {
        Task<StatusDto> Create(RoomRequestDto roomCreateDto);
        Task<StatusDto> Update(string? id, RoomRequestDto roomCreateDto);
        Task<StatusDto> Delete(string? id);
        Task<IEnumerable<RoomResponseDto>> GetAll();
        Task<IEnumerable<RoomResponseDto>> GetAllBy(DateTime? checkIn, DateTime? checkOut, string? querySearch);
        Task<RoomResponseDto> GetById(string id);
    }
}
