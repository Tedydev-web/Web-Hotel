using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO.RoomDtos;
using WebHotel.DTO.RoomTypeDtos;
using WebHotel.DTO.ServiceAttachDtos;

namespace WebHotel.Repository.UserRepository.RoomUserRepository;

public class RoomUserRepository : IRoomUserRepository
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;

    public RoomUserRepository(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task CheckDiscount(Room room)
    {
        var discount = await _context.DiscountRoomDetails.Include(a => a.Discount)
            .Where(a => a.RoomId == room.Id).Where(a => a.Discount.StartAt <= DateTime.Now).Where(a => a.Discount.EndAt >= DateTime.Now).Where(a => a.Discount.AmountUse > 0).SingleOrDefaultAsync();
        if (discount != null)
        {
            room.DiscountPrice = room.CurrentPrice * (100 - discount.Discount.DiscountPercent) / 100;
            _context.Entry(room).State = EntityState.Modified;
        }
        else
        {
            room.DiscountPrice = 0;
            _context.Entry(room).State = EntityState.Modified;
        }
    }

    public async Task<IEnumerable<RoomResponseDto>> GetAll()
    {
        var roomBases = await _context.Rooms.Include(a => a.RoomType).Include(a => a.RoomType.ServiceAttachDetails).AsNoTracking().OrderByDescending(a => a.CreatedAt).ToListAsync();
        if (roomBases == null)
        {
            return default!;
        }
        var roomResponse = new RoomResponseDto();
        var roomResponses = new List<RoomResponseDto>();
        foreach (var item in roomBases)
        {
            await CheckDiscount(item);
            roomResponse = _mapper.Map<RoomResponseDto>(item);
            roomResponse.RoomTypeName = item.RoomType.TypeName;
            var serviceAttachIds = item.RoomType.ServiceAttachDetails.Where(a => a.RoomTypeId == item.RoomType.Id).Select(a => a.ServiceAttachId);
            roomResponse.ServiceAttachs = _mapper.Map<List<ServiceAttachResponseDto>>(await _context.ServiceAttaches.Where(a => serviceAttachIds.Contains(a.Id)).ToListAsync());
            roomResponses.Add(roomResponse);
        }
        await _context.SaveChangesAsync();
        return roomResponses;
    }

    public async Task<RoomResponseDto> GetById(string id)
    {
        var roomBases = _context.Rooms.Include(a => a.RoomType).Include(a => a.RoomType.ServiceAttachDetails).AsNoTracking().SingleOrDefault(a => a.Id == id);
        if (roomBases != null)
        {
            var roomResponse = new RoomResponseDto();
            await CheckDiscount(roomBases);
            roomResponse = _mapper.Map<RoomResponseDto>(roomBases);
            roomResponse.RoomTypeName = roomBases.RoomType.TypeName;
            var serviceAttachIds = roomBases.RoomType.ServiceAttachDetails.Where(a => a.RoomTypeId == roomBases.RoomType.Id).Select(a => a.ServiceAttachId);
            roomResponse.ServiceAttachs = _mapper.Map<List<ServiceAttachResponseDto>>(await _context.ServiceAttaches.Where(a => serviceAttachIds.Contains(a.Id)).ToListAsync());
            return roomResponse;
        }
        await _context.SaveChangesAsync();
        return default!;
    }

    public async Task<IEnumerable<RoomResponseDto>> GetAllBy(RoomDataSearchDto roomDataSearchDto)
    {
        var roomBasesQuery = _context.Rooms.Include(a => a.RoomType).Include(a => a.RoomType.ServiceAttachDetails).AsNoTracking().OrderByDescending(a => a.CreatedAt).AsQueryable();
        if (roomDataSearchDto.checkIn is not null && roomDataSearchDto.checkOut is not null)
        {
            var reservation = _context.Reservations.Where(a => (a.EndDate >= roomDataSearchDto.checkIn && a.EndDate <= roomDataSearchDto.checkOut) || (a.StartDate >= roomDataSearchDto.checkIn && a.StartDate <= roomDataSearchDto.checkOut)).Select(a => a.RoomId);
            roomBasesQuery = roomBasesQuery.Where(a => !reservation.Contains(a.Id));
        }
        if (roomDataSearchDto.price > 0)
        {
            roomBasesQuery = roomBasesQuery.Where(a => a.CurrentPrice <= roomDataSearchDto.price || a.DiscountPrice > 0 && a.DiscountPrice <= roomDataSearchDto.price);
        }
        if (roomDataSearchDto.typeRoomId > 0)
        {
            roomBasesQuery = roomBasesQuery.Include(a => a.RoomType).Where(a => a.RoomType.Id == roomDataSearchDto.typeRoomId);
        }
        if (roomDataSearchDto.star > 0)
        {
            roomBasesQuery = roomBasesQuery.Where(a => a.StarSum == roomDataSearchDto.star);
        }
        if (roomDataSearchDto.peopleNumber > 0)
        {
            roomBasesQuery = roomBasesQuery.Where(a => a.PeopleNumber == roomDataSearchDto.peopleNumber);
        }
        var roomResponse = new RoomResponseDto();
        var roomResponses = new List<RoomResponseDto>();
        var roomBases = await roomBasesQuery.ToListAsync();
        if (roomBases == null)
        {
            return default!;
        }
        foreach (var item in roomBases)
        {
            await CheckDiscount(item);
            roomResponse = _mapper.Map<RoomResponseDto>(item);
            roomResponse.RoomTypeName = item.RoomType.TypeName;
            var serviceAttachIds = item.RoomType.ServiceAttachDetails.Where(a => a.RoomTypeId == item.RoomType.Id).Select(a => a.ServiceAttachId);
            roomResponse.ServiceAttachs = _mapper.Map<List<ServiceAttachResponseDto>>(await _context.ServiceAttaches.Where(a => serviceAttachIds.Contains(a.Id)).ToListAsync());
            roomResponses.Add(roomResponse);
        }
        await _context.SaveChangesAsync();
        return roomResponses;
    }

    public async Task<RoomSearchDto> GetRoomSearch()
    {
        var roomSearch = new RoomSearchDto();
        var room = _context.Rooms;
        if (await room.AnyAsync())
        {
            roomSearch.MaxPerson = await room.MaxAsync(a => a.PeopleNumber);
            roomSearch.MaxPrice = await room.MaxAsync(a => a.CurrentPrice);
            roomSearch.ServiceAttachs = _mapper.Map<List<ServiceAttachResponseDto>>(await _context.ServiceAttaches.OrderByDescending(a => a.Id).ToListAsync());
            roomSearch.RoomTypes = _mapper.Map<List<RoomTypeResponseDto>>(await _context.RoomTypes.OrderByDescending(a => a.Id).ToListAsync());
            return roomSearch;
        }
        return default!;
    }

    public async Task<IEnumerable<RoomResponseDto>> GetTopNew()
    {
        var roomBases = await _context.Rooms.Include(a => a.RoomType).Include(a => a.RoomType.ServiceAttachDetails).AsNoTracking().OrderByDescending(a => a.CreatedAt).Take(5).ToListAsync();
        if (roomBases == null)
        {
            return default!;
        }
        var roomResponse = new RoomResponseDto();
        var roomResponses = new List<RoomResponseDto>();
        foreach (var item in roomBases)
        {
            await CheckDiscount(item);
            roomResponse = _mapper.Map<RoomResponseDto>(item);
            roomResponse.RoomTypeName = item.RoomType.TypeName;
            var serviceAttachIds = item.RoomType.ServiceAttachDetails.Where(a => a.RoomTypeId == item.RoomType.Id).Select(a => a.RoomTypeId);
            roomResponse.ServiceAttachs = _mapper.Map<List<ServiceAttachResponseDto>>(await _context.ServiceAttaches.Where(a => serviceAttachIds.Contains(a.Id)).ToListAsync());
            roomResponses.Add(roomResponse);
        }
        await _context.SaveChangesAsync();
        return roomResponses;
    }
    public async Task<IEnumerable<RoomResponseDto>> GetTopOnSale()
    {
        var roomBases = await _context.Rooms.Include(a => a.RoomType).Include(a => a.RoomType.ServiceAttachDetails).AsNoTracking().OrderByDescending(a => a.CreatedAt).ToListAsync();
        if (roomBases == null)
        {
            return default!;
        }
        var roomResponse = new RoomResponseDto();
        var roomResponses = new List<RoomResponseDto>();
        foreach (var item in roomBases)
        {
            await CheckDiscount(item);
            roomResponse = _mapper.Map<RoomResponseDto>(item);
            roomResponse.RoomTypeName = item.RoomType.TypeName;
            var serviceAttachIds = item.RoomType.ServiceAttachDetails.Where(a => a.RoomTypeId == item.RoomType.Id).Select(a => a.RoomTypeId);
            roomResponse.ServiceAttachs = _mapper.Map<List<ServiceAttachResponseDto>>(await _context.ServiceAttaches.Where(a => serviceAttachIds.Contains(a.Id)).ToListAsync());
            roomResponses.Add(roomResponse);
        }
        await _context.SaveChangesAsync();
        var result = roomResponses.Where(a => a.DiscountPrice != 0).OrderByDescending(a => a.DiscountPrice).Take(5);
        return result;
    }
}
