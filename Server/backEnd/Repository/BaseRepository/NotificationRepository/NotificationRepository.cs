using AutoMapper;
using Database.Data;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO;

namespace WebHotel.Repository.BaseRepository.NotificationRepository;

public class NotificationRepository : INotificationRepository
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;

    public NotificationRepository(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public bool Create(NotificationCreateDto notificationCreate)
    {
        throw new NotImplementedException();
    }

    public bool DeleteAll()
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteById(int id)
    {
        var result = _context.Notifications.SingleOrDefaultAsync(x => x.Id == id);
        if (result == null)
        {
            return false;
        }
        _context.Remove(result);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<NotificationResponseDtos> GetAll(string userId)
    {
        var result = _mapper.Map<List<NotificationResponseDto>>(await _context.Notifications.Where(a => a.UserId == userId).ToListAsync());
        return new NotificationResponseDtos { Items = result, Count = result.Count };
    }
}
