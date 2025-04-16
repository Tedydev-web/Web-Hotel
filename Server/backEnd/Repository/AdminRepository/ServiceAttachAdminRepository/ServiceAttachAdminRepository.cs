using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO;
using WebHotel.DTO.ServiceAttachDtos;

namespace WebHotel.Repository.AdminRepository.ServiceAttachRepository
{
    public class ServiceAttachAdminRepository : IServiceAttachAdminRepository
    {
        private readonly IMapper _mapper;
        private readonly MyDBContext _context;

        public ServiceAttachAdminRepository(IMapper mapper, MyDBContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<StatusDto> Create(ServiceAttachRequestDto serviceAttachDto)
        {
            var serviceAttach = _mapper.Map<ServiceAttach>(serviceAttachDto);
            try
            {
                await _context.AddAsync(serviceAttach);
                await _context.SaveChangesAsync();
                return new StatusDto { StatusCode = 1, Message = "Created successfully" };
            }
            catch (Exception ex)
            {
                return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
            }
        }

        public async Task<StatusDto> Update(ServiceAttachRequestDto serviceAttachDto, int id)
        {
            var serviceAttachBase = await _context.ServiceAttaches.SingleOrDefaultAsync(
                a => a.Id == id
            );
            if (serviceAttachBase is not null)
            {
                var serviceAttach = _mapper.Map(serviceAttachDto, serviceAttachBase);
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
            else
            {
                return new StatusDto { StatusCode = 0, Message = "ID not found" };
            }
        }

        public async Task<StatusDto> Delete(int? id)
        {
            var serviceAttach = await _context.ServiceAttaches.SingleOrDefaultAsync(
                a => a.Id == id
            );
            if (serviceAttach is not null)
            {
                try
                {
                    _context.ServiceAttaches.Remove(serviceAttach);
                    await _context.SaveChangesAsync();
                    return new StatusDto { StatusCode = 1, Message = "Successful deleted " };
                }
                catch (Exception ex)
                {
                    return new StatusDto { StatusCode = 0, Message = ex.InnerException?.Message };
                }
            }
            return new StatusDto { StatusCode = 0, Message = "Id not found!" };
        }

        public async Task<IEnumerable<ServiceAttachResponseDto>> GetAll()
        {
            var serviceAttach = _mapper.Map<List<ServiceAttachResponseDto>>(
                await _context.ServiceAttaches
                    .AsNoTracking()
                    .OrderByDescending(a => a.Id)
                    .ToListAsync()
            );
            return serviceAttach;
        }
    }
}
