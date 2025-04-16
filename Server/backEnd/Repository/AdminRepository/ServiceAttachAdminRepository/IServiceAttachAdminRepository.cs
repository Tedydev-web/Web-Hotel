using WebHotel.DTO;
using WebHotel.DTO.ServiceAttachDtos;

namespace WebHotel.Repository.AdminRepository.ServiceAttachRepository
{
    public interface IServiceAttachAdminRepository
    {
        Task<StatusDto> Create(ServiceAttachRequestDto serviceAttach);

        Task<IEnumerable<ServiceAttachResponseDto>> GetAll();

        Task<StatusDto> Delete(int? id);

        Task<StatusDto> Update(ServiceAttachRequestDto serviceAttachDto, int id);
    }
}
