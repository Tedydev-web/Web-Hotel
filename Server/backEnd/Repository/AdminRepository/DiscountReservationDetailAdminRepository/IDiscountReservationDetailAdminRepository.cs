using WebHotel.DTO;
using WebHotel.DTO.DiscountReservationDetailDtos;

namespace WebHotel.Repository.AdminRepository.DiscountReservationDetailAdminRepository;

public interface IDiscountReservationDetailAdminRepository
{
    Task<StatusDto> Create(DiscountReservationDetailRequest discountReservationDetailRequest, string email);
}
