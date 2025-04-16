using AutoMapper;
using Database.Data;
using Database.Models;
using WebHotel.DTO;
using WebHotel.DTO.DiscountReservationDetailDtos;

namespace WebHotel.Repository.AdminRepository.DiscountReservationDetailAdminRepository;

public class DiscountReservationDetailAdminRepository : IDiscountReservationDetailAdminRepository
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;

    public DiscountReservationDetailAdminRepository(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    public async Task<StatusDto> Create(DiscountReservationDetailRequest discountReservationDetailRequest, string email)
    {
        var user = _context.ApplicationUsers.SingleOrDefault(a => a.Email == email);
        if (user != null)
        {
            var discountDetail = _mapper.Map<DiscountReservationDetail>(discountReservationDetailRequest);
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
