using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO;
using WebHotel.DTO.DiscountTypeDtos;

namespace WebHotel.Repository.AdminRepository.DiscountTypeRepository
{
    public class DiscountTypeAdminRepository : IDiscountTypeAdminRepository
    {
        private readonly MyDBContext _context;
        private readonly IMapper _mapper;

        public DiscountTypeAdminRepository(MyDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<StatusDto> Create(DiscountTypeRequestDto discountTypeDto)
        {
            if (_context.DiscountTypes.SingleOrDefault(a => a.Name == discountTypeDto.Name) != null)
            {
                return new StatusDto { StatusCode = 0, Message = "Create failed, name already exists" };
            }
            var discountType = new DiscountType
            {
                Name = discountTypeDto.Name!
            };
            try
            {
                await _context.AddAsync(discountType);
                await _context.SaveChangesAsync();
                return new StatusDto { StatusCode = 1, Message = "Created successfully" };
            }
            catch
            {
                return new StatusDto { StatusCode = 0, Message = "Create failed, error system" };
            }
        }

        public async Task<StatusDto> Delete(int? id)
        {
            var discountType = _context.DiscountTypes.SingleOrDefaultAsync(a => a.Id == id);
            if (discountType != null)
            {
                try
                {
                    _context.Remove(discountType);
                    await _context.SaveChangesAsync();
                    return new StatusDto { StatusCode = 1, Message = "Deleted successfully" };
                }
                catch (Exception ex)
                {
                    return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
                }
            }
            return new StatusDto { StatusCode = 0, Message = "Discount type not exists" };

        }

        public async Task<IEnumerable<DiscountTypeResponseDto>> GetAll()
        {
            var discountTypes = await _context.DiscountTypes.AsNoTracking().OrderByDescending(a => a.Id).ToListAsync();
            var result = _mapper.Map<List<DiscountTypeResponseDto>>(discountTypes);
            return result;
        }

        public async Task<StatusDto> Update(int? id, DiscountTypeResponseDto discountTypeDto)
        {
            var discountType = await _context.DiscountTypes.SingleOrDefaultAsync(a => a.Id == id);
            if (discountType == null)
            {
                return new StatusDto { StatusCode = 0, Message = "Id not found" };
            }
            try
            {
                _mapper.Map(discountTypeDto, discountType);
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
