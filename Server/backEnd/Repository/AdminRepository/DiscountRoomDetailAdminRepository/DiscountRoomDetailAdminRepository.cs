using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO;
using WebHotel.DTO.DiscountRoomDetailDtos;
using WebHotel.Repository.AdminRepository.DiscountRoomDetailAdminRepository;

namespace WebHotel.Repository.AdminRepository.DiscountRoomDetailRepository
{
    public class DiscountRoomDetailAdminRepository : IDiscountRoomDetailAdminRepository
    {
        private readonly MyDBContext _context;
        private readonly IMapper _mapper;

        public DiscountRoomDetailAdminRepository(MyDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<StatusDto> Create(DiscountRoomDetailRequest discountRoomDetailRequest, string email)
        {
            var user = await _context.ApplicationUsers.SingleOrDefaultAsync(a => a.Email == email);
            var discountRoomRequest = await _context.Discounts.SingleOrDefaultAsync(a => a.Id == discountRoomDetailRequest.DiscountId);
            var discountDetails = await _context.DiscountRoomDetails.Where(a => a.RoomId == discountRoomDetailRequest.RoomId).Where(a => a.Discount.StartAt < discountRoomRequest!.EndAt && a.Discount.EndAt > discountRoomRequest.StartAt).ToListAsync();

            if (discountRoomRequest is null)
            {
                return new StatusDto { StatusCode = 0, Message = "Room not found" };
            }
            if (discountDetails.Count != 0)
            {
                return new StatusDto { StatusCode = 0, Message = "Room has added discount code at this time" };
            }
            if (user != null)
            {
                var discountDetail = _mapper.Map<DiscountRoomDetail>(discountRoomDetailRequest);
                discountDetail.CreatorId = user.Id;
                try
                {
                    await _context.AddAsync(discountDetail);
                    await _context.SaveChangesAsync();
                    return new StatusDto { StatusCode = 1, Message = "Created successfully" };
                }
                catch (Exception ex)
                {
                    return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
                }
            }
            return new StatusDto { StatusCode = 0, Message = "Create discount error" };
        }
    }
}
