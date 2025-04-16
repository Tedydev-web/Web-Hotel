using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO;
using WebHotel.DTO.RoomTypeDtos;

namespace WebHotel.Repository.AdminRepository.RoomTypeRepository
{
    public class RoomTypeAdminRepository : IRoomTypeAdminRepository
    {
        private readonly MyDBContext _context;
        private readonly IMapper _mapper;

        public RoomTypeAdminRepository(MyDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<StatusDto> Create(RoomTypeRequestDto roomTypeCreateDto)
        {
            try
            {
                await _context.AddAsync(_mapper.Map<RoomType>(roomTypeCreateDto));
                await _context.SaveChangesAsync();
                return new StatusDto { StatusCode = 1, Message = "Successfully created new!" };
            }
            catch
            {
                return new StatusDto { StatusCode = 0, Message = "Type name already exists!" };
            }
        }

        public async Task<StatusDto> Delete(int? id)
        {
            var roomType = await _context.RoomTypes.SingleOrDefaultAsync(a => a.Id == id);
            if (roomType != null)
            {
                try
                {
                    _context.Remove(roomType);
                    await _context.SaveChangesAsync();
                    return new StatusDto { StatusCode = 1, Message = "Deleted successfully" };
                }
                catch (Exception ex)
                {
                    return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
                }
            }
            return new StatusDto { StatusCode = 0, Message = "Room type not exists" };

        }

        public async Task<IEnumerable<RoomTypeResponseDto>> GetAll()
        {
            var roomTypes = await _context.RoomTypes.AsNoTracking().OrderByDescending(a => a.Id).ToListAsync();
            var result = _mapper.Map<List<RoomTypeResponseDto>>(roomTypes);
            return result;
        }

        public async Task<StatusDto> Update(int? id, RoomTypeRequestDto roomTypeRequestDto)
        {
            var roomTypes = await _context.RoomTypes.SingleOrDefaultAsync(a => a.Id == id);
            if (roomTypes == null)
            {
                return new StatusDto { StatusCode = 0, Message = "Id not found" };
            }
            try
            {
                _mapper.Map(roomTypeRequestDto, roomTypes);
                await _context.SaveChangesAsync();
                return new StatusDto { StatusCode = 1, Message = "Updated successfully" };
            }
            catch (Exception e)
            {
                return new StatusDto { StatusCode = 0, Message = e.InnerException?.Message };
            }
        }
    }
}
