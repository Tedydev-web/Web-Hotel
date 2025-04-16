using WebHotel.DTO;
using WebHotel.DTO.DiscountDtos;

namespace WebHotel.Repository.AdminRepository.DiscountRepository
{
    public interface IDiscountAdminRepository
    {
        Task<StatusDto> Create(DiscountRequestDto discountRequestDto, string Email);

        Task<StatusDto> Update(int? id, DiscountUpdateDto discountUpdateDto);

        Task<IEnumerable<DiscountResponseDto>> GetAll();

        Task<DiscountResponseDto> GetById(int? id);

        IEnumerable<DiscountResponseDto> GetBySearch(string? discountCode, string? name, decimal? percentDiscount, DateTime? startAt, DateTime? endAt, string? nameType, string? creatorEmail);

        Task<StatusDto> Delete(int? id);
    }
}
