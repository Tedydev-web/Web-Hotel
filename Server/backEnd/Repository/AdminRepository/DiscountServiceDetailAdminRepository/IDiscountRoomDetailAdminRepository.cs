using WebHotel.DTO;
using WebHotel.DTO.DiscountServiceDetailDtos;

namespace WebHotel.Repository.AdminRepository.DiscountServiceDetailAdminRepository
{
    public interface IDiscountServiceDetailAdminRepository
    {
        Task<StatusDto> Create(DiscountServiceDetailRequest discountServiceDetailRequest, string email);
    }
}
