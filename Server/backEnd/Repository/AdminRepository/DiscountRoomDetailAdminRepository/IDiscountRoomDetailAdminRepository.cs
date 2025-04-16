using WebHotel.DTO;
using WebHotel.DTO.DiscountRoomDetailDtos;

namespace WebHotel.Repository.AdminRepository.DiscountRoomDetailAdminRepository
{
    public interface IDiscountRoomDetailAdminRepository
    {
        Task<StatusDto> Create(DiscountRoomDetailRequest discountRoomDetailRequest, string email);
    }
}
