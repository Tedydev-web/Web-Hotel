using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using WebHotel.DTO;
using WebHotel.DTO.RoomDtos;
using WebHotel.DTO.ServiceAttachDtos;
using WebHotel.Service.FileService;

namespace WebHotel.Repository.AdminRepository.RoomRepository
{
    public partial class RoomAdminRepository : IRoomAdminRepository
    {
        private readonly MyDBContext _context;
        private readonly IMapper _mapper;
        private readonly IFileService _fileService;

        public RoomAdminRepository(MyDBContext context, IMapper mapper, IFileService fileService)
        {
            _context = context;
            _mapper = mapper;
            _fileService = fileService;
        }

        public async Task<StatusDto> Update(string? id, RoomRequestDto roomCreateDto)
        {
            var room = await _context.Rooms.SingleOrDefaultAsync(a => a.Id == id);
            if (room is not null)
            {
                _mapper.Map(roomCreateDto, room);
                if (roomCreateDto.RoomPicture is not null)
                {
                    var checkSendFile = await _fileService.SendFile("Room/" + roomCreateDto.RoomNumber, roomCreateDto.RoomPicture!);
                    if (checkSendFile.Status == 1)
                    {
                        room.RoomPicture = checkSendFile.Url;
                    }
                    else
                    {
                        return new StatusDto { StatusCode = 0, Message = checkSendFile.Errors };
                    }
                }
                if (roomCreateDto.RoomPictures is not null)
                {
                    var listImage = new List<string>();
                    foreach (var item in roomCreateDto.RoomPictures)
                    {
                        var checkSendFile = await _fileService.SendFile("RoomDetail/" + roomCreateDto.RoomNumber, item);
                        if (checkSendFile.Status == 1)
                        {
                            listImage.Add(checkSendFile.Url!);
                        }
                        else
                        {
                            return new StatusDto { StatusCode = 0, Message = checkSendFile.Errors };
                        }
                    }
                    room.RoomPictures = JsonConvert.SerializeObject(listImage);
                }
                try
                {
                    await _context.SaveChangesAsync();
                    return new StatusDto { StatusCode = 1, Message = "Updated successfully" };
                }
                catch (Exception ex)
                {
                    return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
                }
            }
            return new StatusDto { StatusCode = 0, Message = "Room not exists" };
        }

        public async Task<StatusDto> Delete(string? id)
        {
            var room = await _context.Rooms.SingleOrDefaultAsync(a => a.Id == id);
            if (room is not null)
            {
                try
                {
                    _context.Remove(room);
                    await _context.SaveChangesAsync();
                    return new StatusDto { StatusCode = 1, Message = "Removed successfully" };
                }
                catch (Exception ex)
                {
                    return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
                }
            }
            return new StatusDto { StatusCode = 0, Message = "Room not exists" };

        }

        public async Task<StatusDto> Create(RoomRequestDto roomCreateDto)
        {
            var room = _mapper.Map<Room>(roomCreateDto);
            try
            {
                if (roomCreateDto.RoomPicture is not null)
                {
                    var checkSendFile = await _fileService.SendFile("Room/" + roomCreateDto.RoomNumber, roomCreateDto.RoomPicture!);
                    if (checkSendFile.Status == 1)
                    {
                        room.RoomPicture = checkSendFile.Url;
                    }
                    else
                    {
                        return new StatusDto { StatusCode = 0, Message = checkSendFile.Errors };
                    }
                }
                if (roomCreateDto.RoomPictures is not null)
                {
                    var listImage = new List<string>();
                    foreach (var item in roomCreateDto.RoomPictures)
                    {
                        var checkSendFile = await _fileService.SendFile("RoomDetail/" + roomCreateDto.RoomNumber, item);
                        if (checkSendFile.Status == 1)
                        {
                            listImage.Add(checkSendFile.Url!);
                        }
                        else
                        {
                            return new StatusDto { StatusCode = 0, Message = checkSendFile.Errors };
                        }
                    }
                    room.RoomPictures = JsonConvert.SerializeObject(listImage);
                }
                await _context.AddAsync(room);
                await _context.SaveChangesAsync();
                return new StatusDto { StatusCode = 1, Message = "Room created successfully!" };
            }
            catch (DbUpdateException ex)
            {
                return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
            }
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
            var roomBases = await _context.Rooms.Include(a => a.RoomType).Include(a => a.RoomType.ServiceAttachDetails).OrderByDescending(a => a.CreatedAt).AsNoTracking().ToListAsync();
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

        public async Task<IEnumerable<RoomResponseDto>> GetAllBy(DateTime? checkIn, DateTime? checkOut, string? querySearch)
        {
            var roomBasesQuery = _context.Rooms.Include(a => a.RoomType).Include(a => a.RoomType.ServiceAttachDetails).AsNoTracking().OrderByDescending(a => a.CreatedAt).AsQueryable();
            decimal searchDecimal;
            if (checkIn is not null && checkOut is not null)
            {
                var reservation = _context.Reservations.Where(a => a.EndDate <= checkIn || a.StartDate >= checkOut).Select(a => a.RoomId);
                roomBasesQuery = _context.Rooms.Where(a => reservation.Contains(a.Id));
            }
            if (querySearch?.Length > 0)
            {
                if (Decimal.TryParse(querySearch, out searchDecimal))
                {
                    roomBasesQuery = roomBasesQuery.Where(a => a.CurrentPrice == searchDecimal || (a.DiscountPrice > 0 && a.DiscountPrice == searchDecimal) || a.StarSum == (int)searchDecimal || a.PeopleNumber == (int)searchDecimal || a.RoomNumber.Contains(querySearch!));
                }
                else
                {
                    roomBasesQuery = roomBasesQuery.Where(a => a.RoomType.TypeName.Contains(querySearch!) || a.RoomNumber.Contains(querySearch!) || a.Name.Contains(querySearch!));
                }
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
    }
}
