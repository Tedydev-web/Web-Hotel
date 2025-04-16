using WebHotel.DTO.ReservationDtos;

namespace WebHotel.Repository.UserRepository.ReservationRepository
{
    public interface IReservationUserRepository
    {
        Task<ReservationStatusDto> Create(ReservationCreateDto reservationCreateDto, string email);
    }
}
