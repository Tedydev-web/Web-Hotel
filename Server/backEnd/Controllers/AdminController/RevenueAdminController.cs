using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO.AccountDtos;
using WebHotel.DTO.RoomDtos;
using WebHotel.DTO.ServiceAttachDtos;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/revenue/")]
//[Authorize]
public class RevenueAdminController : ControllerBase
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;

    public RevenueAdminController(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet("get-sum")]
    public async Task<IActionResult> GetSum(int year)
    {
        var customerIds = await _context.ApplicationUserRoles
            .Include(a => a.Role)
            .Where(a => a.Role!.Name == "User")
            .Select(a => a.UserId)
            .Distinct()
            .ToListAsync();

        var sumCustomer = await _context.ApplicationUsers
            .Where(a => customerIds.Contains(a.Id))
            .Where(a => a.CreatedAt!.Value.Year == year)
            .GroupBy(a => a.CreatedAt!.Value.Year)
            .Select(a => a.Count())
            .ToListAsync();

        var sumReservation = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .GroupBy(a => a.PayAt.Year)
            .Select(a => a.Count())
            .ToListAsync();

        var sumRevenue = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .GroupBy(a => a.PayAt.Year)
            .Select(a => a.Sum(a => (a.PriceService + a.PriceReservedRoom)))
            .ToListAsync();

        var result = new
        {
            Year = year,
            Result = new Revenue
            {
                SumCustomer = sumCustomer.ElementAtOrDefault(0),
                SumReservation = sumReservation.ElementAtOrDefault(0),
                SumRevenue =
                    sumRevenue.ElementAtOrDefault(0).HasValue == true
                        ? sumRevenue.ElementAtOrDefault(0)!.Value
                        : 0,
            }
        };

        return Ok(result);
    }

    [HttpGet("revenue-by-year")]
    public async Task<IActionResult> RevenueByYear(int year)
    {
        var result = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .GroupBy(a => a.PayAt.Month)
            .Select(
                a =>
                    new
                    {
                        Month = a.Key,
                        Revenue = a.Sum(a => (a.PriceReservedRoom + a.PriceService))
                    }
            )
            .ToListAsync();
        return Ok(result);
    }

    [HttpGet("revenue-by-month")]
    public async Task<IActionResult> RevenueByMonth(int month, int year)
    {
        var result = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .Where(a => a.PayAt.Month == month)
            .GroupBy(a => a.PayAt.Day)
            .Select(
                a =>
                    new
                    {
                        Day = a.Key,
                        Revenue = a.Sum(a => (a.PriceReservedRoom + a.PriceService))
                    }
            )
            .ToListAsync();
        return Ok(result);
    }

    [HttpGet("get-for-type-room")]
    public async Task<IActionResult> RevenueForTypeRoom(int year)
    {
        var result = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .Include(a => a.Reservation)
            .ThenInclude(a => a.Room)
            .ThenInclude(a => a.RoomType)
            .GroupBy(a => a.Reservation.Room.RoomType.TypeName)
            .Select(
                a =>
                    new RevenueTypeRoom
                    {
                        TypeRoomName = a.Key,
                        Price = a.Sum(a => (a.PriceReservedRoom + a.PriceService!.Value))
                    }
            )
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("get-room-and-service")]
    public async Task<IActionResult> RevenueRoomAndService(int year)
    {
        var result = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .GroupBy(a => a.PayAt.Year)
            .Select(
                a =>
                    new RevenueRoomAndService
                    {
                        PriceRoom = a.Sum(a => a.PriceReservedRoom),
                        PriceService = a.Sum(a => a.PriceService!.Value)
                    }
            )
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("get-room-top-booked")]
    public async Task<IActionResult> RevenueRoomTopBooked(int year)
    {
        var result = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .Include(a => a.Reservation)
            .ThenInclude(a => a.Room)
            .GroupBy(a => a.Reservation.Room.Id)
            .Select(
                a =>
                    new RevenueTopRoomBooked
                    {
                        Room = _mapper.Map<RoomResponseTopRevenueDto>(
                            _context.Rooms
                                .Include(a => a.RoomType)
                                .SingleOrDefault(b => b.Id == a.Key)
                        ),
                        Count = a.Count(),
                        Sum = a.Sum(a=>a.PriceReservedRoom)
                    }
            )
            .ToListAsync();
        result.ForEach(b =>
        {
            b.Room.RoomTypeName = _context.RoomTypes
                .SingleOrDefault(a => a.Id == b.Room.RoomTypeId)!
                .TypeName;
        });

        return Ok(result);
    }

    [HttpGet("get-user-top-booked")]
    public async Task<IActionResult> RevenueUserTopBooked(int year)
    {
        var result = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .Where(a => a.SelfPay == false)
            .Include(a => a.Reservation)
            .ThenInclude(a => a.User)
            .GroupBy(a => a.Reservation.User.Id)
            .Select(
                a =>
                    new RevenueTopUserBooked
                    {
                        User = _mapper.Map<AccountResponseTopDto>(
                            _context.ApplicationUsers.SingleOrDefault(b => b.Id == a.Key)
                        ),
                        Count = a.Count(),
                        Sum = a.Sum(a=>a.PriceReservedRoom + a.PriceService)!.Value
                    }
            )
            .ToListAsync();
        return Ok(result);
    }

    [HttpGet("get-employee-top-booked")]
    public async Task<IActionResult> RevenueEmployeeTopBooked(int year)
    {
        var result = await _context.InvoiceReservations
            .Where(a => a.PayAt.Year == year)
            .Where(a => a.SelfPay == true)
            .Include(a => a.Reservation)
            .ThenInclude(a => a.User)
            .GroupBy(a => a.Reservation.User.Id)
            .Select(
                a =>
                    new RevenueTopUserBooked
                    {
                        User = _mapper.Map<AccountResponseTopDto>(
                            _context.ApplicationUsers.SingleOrDefault(b => b.Id == a.Key)
                        ),
                        Count = a.Count(),
                        Sum = a.Sum(a=>a.PriceReservedRoom + a.PriceService)!.Value
                    }
            )
            .ToListAsync();
        return Ok(result);
    }

    [HttpGet("get-service-room-top-booked")]
    public async Task<IActionResult> RevenueServiceRoomTopBooked(int year)
    {
        var result = await _context.OrderServices
            .Include(a => a.Reservation)
            .Include(a => a.ServiceRoom)
            .Where(a => a.Reservation.CreatedAt.Year == year)
            .GroupBy(a=> new {a.ServiceRoom.Name, a.ServiceRoom.Price})
            .Select(a=> new {
                ServiceName = a.Key,
                Count = a.Count(),
                Sum = a.Sum(a=>a.Price * a.Amount)
            })
            .ToListAsync();
        return Ok(result);
    }
}
public class OrderServiceTopDto
{
    public int Id { get; set; }

    public string ServiceName { get; set; } = null!;

    public decimal Price { get; set; }

    public int Amount { get; set; }

    public string CreatorEmail { get; set; } = null!;
}

public class Revenue
{
    public int SumCustomer { get; set; }
    public int SumReservation { get; set; }
    public decimal SumRevenue { get; set; }
}

public class RevenueTypeRoom
{
    public string? TypeRoomName { get; set; }
    public decimal Price { get; set; }
}

public class RevenueRoomAndService
{
    public decimal PriceService { get; set; }
    public decimal PriceRoom { get; set; }
}

public class RevenueTopRoomBooked
{
    public RoomResponseTopRevenueDto Room { get; set; } = null!;
    public int Count { get; set; } = 0;
    public decimal Sum {get;set;} = 0;
}

public class RevenueTopUserBooked
{
    public AccountResponseTopDto User { get; set; } = null!;
    public int Count { get; set; } = 0;
    public decimal Sum {get;set;} = 0;
}

public class AccountResponseTopDto
{
    public string? Id { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? CMND { get; set; }
    public string? Image { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? PhoneNumber { get; set; }
    public List<string> Roles { get; set; } = null!;
}

public class RoomResponseTopRevenueDto
    {
        public string Id { get; set; } = null!;

        public string RoomNumber { get; set; } = null!;

        public string Name { get; set; } = null!;

        public int? StarAmount { get; set; }

        public decimal CurrentPrice { get; set; }

        public int RoomTypeId { get; set; }

        public string? RoomTypeName { get; set; }
    }
