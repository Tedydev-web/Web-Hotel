using WebHotel.DTO;
using WebHotel.DTO.DiscountTypeDtos;

namespace WebHotel.Repository.AdminRepository.DiscountTypeRepository
{
    public interface IDiscountTypeAdminRepository
    {
        Task<StatusDto> Create(DiscountTypeRequestDto discountTypeDto);
        Task<StatusDto> Update(int? id, DiscountTypeResponseDto discountTypeDto);
        Task<StatusDto> Delete(int? id);
        Task<IEnumerable<DiscountTypeResponseDto>> GetAll();
    }
}
