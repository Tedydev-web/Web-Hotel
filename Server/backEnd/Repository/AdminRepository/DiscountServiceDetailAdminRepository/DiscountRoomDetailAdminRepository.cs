using AutoMapper;
using Database.Data;
using Database.Models;
using WebHotel.DTO;
using WebHotel.DTO.DiscountServiceDetailDtos;

namespace WebHotel.Repository.AdminRepository.DiscountServiceDetailAdminRepository;

public class DiscountServiceDetailAdminRepository : IDiscountServiceDetailAdminRepository
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;

    public DiscountServiceDetailAdminRepository(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    public async Task<StatusDto> Create(DiscountServiceDetailRequest discountServiceDetailRequest, string email)
    {
        var user = _context.ApplicationUsers.SingleOrDefault(a => a.Email == email);
        if (user != null)
        {
            var discountDetail = _mapper.Map<DiscountServiceDetail>(discountServiceDetailRequest);
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
