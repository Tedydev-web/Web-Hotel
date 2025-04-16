using WebHotel.DTO;

namespace WebHotel.Repository.BaseRepository.NotificationRepository
{
    public interface INotificationRepository
    {
        bool DeleteAll();
        Task<bool> DeleteById(int id);
        bool Create(NotificationCreateDto notificationCreate);
        Task<NotificationResponseDtos> GetAll(string userId);
    }
}
