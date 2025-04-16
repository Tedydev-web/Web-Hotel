using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebHotel.DTO;
using WebHotel.DTO.ReservationDtos;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/reservation/")]
[Authorize]
public class ReservationAdminController : ControllerBase
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;
    private static System.Timers.Timer timer;

    public ReservationAdminController(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var reservations = await _context.Reservations.Include(a => a.Room).Include(a => a.ReservationPayment).Where(a => a.ReservationPayment != null).OrderByDescending(a => a.CreatedAt).ToListAsync();
        reservations.ForEach(a => a.ReservationPayment = new ReservationPayment
        {
            Id = a.ReservationPayment.Id,
            Message = a.ReservationPayment.Message,
            CreateAt = a.ReservationPayment.CreateAt,
            PriceTotal = a.ReservationPayment.PriceTotal,
            OrderInfo = a.ReservationPayment.OrderInfo,
            OrderType = a.ReservationPayment.OrderType,
            PayType = a.ReservationPayment.PayType,
            Status = a.ReservationPayment.Status
        });
        if (reservations is null)
        {
            return NotFound();
        }
        var result = _mapper.Map<List<ReservationResponseAdminDto>>(reservations);
        return Ok(result);
    }

    [HttpGet("get-by-id")]
    public async Task<IActionResult> GetById(string id)
    {
        var reservation = await _context.Reservations.Include(a => a.Room).Include(a => a.ReservationPayment).SingleOrDefaultAsync(a => a.Id == id);
        if (reservation is null)
        {
            return NotFound();
        }
        if (reservation.ReservationPayment != null)
        {
            reservation.ReservationPayment = new ReservationPayment
            {
                Id = reservation.ReservationPayment.Id,
                Message = reservation.ReservationPayment.Message,
                CreateAt = reservation.ReservationPayment.CreateAt,
                PriceTotal = reservation.ReservationPayment.PriceTotal,
                OrderInfo = reservation.ReservationPayment.OrderInfo,
                OrderType = reservation.ReservationPayment.OrderType,
                PayType = reservation.ReservationPayment.PayType,
                Status = reservation.ReservationPayment.Status
            };
        }
        var result = _mapper.Map<ReservationResponseAdminDto>(reservation);
        return Ok(result);
    }
    private async Task HandleTimer(string id)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MyDBContext>();
        optionsBuilder.UseSqlServer("Data Source=103.130.212.186;Initial Catalog=webhotel;Persist Security Info=True;User ID=metaron;Password=Hung1997;Connection Timeout=300");
        if (id is not null)
        {
            using (MyDBContext context1 = new MyDBContext(optionsBuilder.Options))
            {
                var reservation = await context1.Reservations.SingleOrDefaultAsync(a => a.Id == id);
                var reservationPayment = await context1.ReservationPayments.SingleOrDefaultAsync(a => a.ReservationId == id);
                if (reservationPayment == null && reservation != null)
                {
                    context1.Remove(reservation!);
                    await context1.SaveChangesAsync();
                    timer.Stop();
                    timer.Dispose();
                }
            }
        }

    }

    [HttpPost("create")]
    public async Task<IActionResult> Create(ReservationCreateDto reservationCreateDto)
    {

        if (reservationCreateDto.StartDate!.Value.Date >= DateTime.Now.Date && reservationCreateDto.EndDate!.Value.Date > reservationCreateDto.StartDate!.Value.Date)
        {
            var room = await _context.Rooms.AsNoTracking().SingleOrDefaultAsync(a => a.Id == reservationCreateDto.RoomId)!;
            var email = User.Claims.FirstOrDefault(a => a.Type == ClaimTypes.Email)!.Value;
            var employee = await _context.Users.AsNoTracking().SingleOrDefaultAsync(a => a.Email == email);
            if (room is not null && employee is not null)
            {
                var reservationExists = await _context.Reservations
                    .Include(a => a.ReservationPayment)
                    .Where(a =>
                    (a.EndDate <= reservationCreateDto.EndDate && a.EndDate >= reservationCreateDto.StartDate) ||
                    (a.StartDate <= reservationCreateDto.EndDate && a.StartDate >= reservationCreateDto.StartDate))
                    .Where(a => a.RoomId == reservationCreateDto.RoomId)
                    .ToListAsync();
                if (reservationExists.Count() == 0)
                {
                    var reservation = _mapper.Map<Reservation>(reservationCreateDto);

                    reservation.UserId = employee.Id;
                    reservation.RoomPrice = (decimal)(room!.DiscountPrice == 0 ? room.CurrentPrice : room.DiscountPrice)!;

                    var startDate = reservationCreateDto.StartDate!.Value;

                    reservation.StartDate = new DateTime(startDate.Year, startDate.Month, startDate.Day, 12, 00, 00);
                    reservation.EndDate = reservation.StartDate.AddDays((double)reservationCreateDto.NumberOfDay!);
                    reservation.ReservationPrice = reservation.RoomPrice * (decimal)reservation.NumberOfDay * (decimal)1.08;
                    try
                    {
                        await _context.Reservations.AddAsync(reservation);
                        await _context.SaveChangesAsync();
                        timer = new System.Timers.Timer(900000);
                        timer.Elapsed += async (sender, e) => await HandleTimer(reservation.Id);
                        timer.Start();
                        return Ok(new ReservationStatusDto { StatusCode = 1, Message = "Successful booking", ReservationId = reservation.Id });
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(new ReservationStatusDto { StatusCode = 0, Message = ex.InnerException?.Message });
                    }
                }
                else
                {
                    return BadRequest(new ReservationStatusDto { StatusCode = 0, Message = "Room is booked" });
                }
            }
            else
            {
                return BadRequest(new StatusDto { StatusCode = 0, Message = "Booking failed. Room or account not valid" });
            }
        }
        return BadRequest(new ReservationStatusDto { StatusCode = 0, Message = "Time failed" });
    }
}


public class ReservationCheck
{
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public string RoomId { get; set; } = null!;
}

public class ReservationResponseAdminDto
{
    public string Id { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public float NumberOfDay { get; set; }
    public DateTime EndDate { get; set; }
    public decimal RoomPrice { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal ReservationPrice { get; set; }
    public string RoomNumber { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public bool Status { get; set; }
    public ReservationPayment ReservationPayment { get; set; } = null!;
}
