using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO;
using WebHotel.DTO.DiscountDtos;

namespace WebHotel.Repository.AdminRepository.DiscountRepository
{
    public class DiscountAdminRepository : IDiscountAdminRepository
    {
        private readonly MyDBContext _context;
        private readonly IMapper _mapper;

        public DiscountAdminRepository(MyDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<StatusDto> Create(DiscountRequestDto discountRequestDto, string email)
        {
            var user = _context.ApplicationUsers.SingleOrDefault(a => a.Email == email);
            if (user != null)
            {
                var discount = _mapper.Map<Discount>(discountRequestDto);
                discount.CreatorId = user.Id;
                try
                {
                    await _context.AddAsync(discount);
                    await _context.SaveChangesAsync();
                    return new StatusDto { StatusCode = 1, Message = "Created successfully" };
                }
                catch (DbUpdateException ex)
                {
                    return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
                }
            }
            return new StatusDto { StatusCode = 0, Message = "Create discount error! Creator not found" };
        }

        public async Task<StatusDto> Delete(int? id)
        {
            try
            {
                var discount = await _context.Discounts.SingleOrDefaultAsync(a => a.Id == id);
                _context.Remove(discount!);
                await _context.SaveChangesAsync();
                return new StatusDto { StatusCode = 1, Message = "Delete successfully" };
            }
            catch
            {
                return new StatusDto { StatusCode = 0, Message = "Delete error" };
            }
        }

        public async Task<IEnumerable<DiscountResponseDto>> GetAll()
        {
            var discountBase = await _context.Discounts.AsNoTracking().Include(a => a.Creator).Include(a => a.Creator.UserRoles).ThenInclude(a => a.Role).Include(a => a.DiscountType).OrderByDescending(a => a.Id).ToListAsync();
            if (discountBase == null)
            {
                return default!;
            }
            var discount = _mapper.Map<IEnumerable<DiscountResponseDto>>(discountBase);
            return discount;
        }

        public async Task<DiscountResponseDto> GetById(int? id)
        {
            var discountBase = await _context.Discounts.AsNoTracking().Include(a => a.Creator).Include(a => a.Creator.UserRoles).ThenInclude(a => a.Role).Include(a => a.DiscountType).SingleOrDefaultAsync(a => a.Id == id);
            if (discountBase == null)
            {
                return default!;
            }
            var discount = _mapper.Map<DiscountResponseDto>(discountBase);
            return discount;
        }

        public IEnumerable<DiscountResponseDto> GetBySearch(string? discountCode, string? name, decimal? percentDiscount, DateTime? startAt, DateTime? endAt, string? nameType, string? creatorEmail)
        {
            var discountBase = _context.Discounts.AsNoTracking().Include(a => a.Creator).Include(a => a.Creator.UserRoles).ThenInclude(a => a.Role).Include(a => a.DiscountType).OrderByDescending(a => a.Id).AsEnumerable();

            if (discountCode?.Length > 0)
            {
                discountBase = discountBase.Where(a => a.DiscountCode.Contains(discountCode));
            }
            if (name?.Length > 0)
            {
                discountBase = discountBase.Where(a => a.Name.Contains(name));
            }
            if (percentDiscount > 0)
            {
                discountBase = discountBase.Where(a => a.DiscountPercent == percentDiscount);
            }
            if (startAt != null)
            {
                discountBase = discountBase.Where(a => a.StartAt >= startAt);
            }
            if (endAt != null)
            {
                discountBase = discountBase.Where(a => a.EndAt <= endAt);
            }
            if (nameType?.Length > 0)
            {
                discountBase = discountBase.Where(a => a.DiscountType.Name.Contains(nameType));
            }
            if (creatorEmail?.Length > 0)
            {
                discountBase = discountBase.Where(a => a.Creator.Email.Contains(creatorEmail));
            }

            if (discountBase == null)
            {
                return default!;
            }
            var discount = _mapper.Map<IEnumerable<DiscountResponseDto>>(discountBase);
            return discount;
        }

        public async Task<StatusDto> Update(int? id, DiscountUpdateDto discountUpdateDto)
        {
            var discount = await _context.Discounts.SingleOrDefaultAsync(a => a.Id == id);
            if (discount == null)
            {
                return new StatusDto { StatusCode = 0, Message = "Id not found" };
            }
            try
            {
                _mapper.Map(discountUpdateDto, discount);
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
