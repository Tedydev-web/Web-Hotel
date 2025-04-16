using AutoMapper;
using Database.Data;
using Database.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebHotel.DTO;
using WebHotel.DTO.PaymentDtos;
using WebHotel.DTO.RoomDtos;

namespace WebHotel.Controllers.UserController;

[ApiController]
[Authorize]
[ApiVersion("1.0")]
[Route("user/")]
public class PaymentUserController : ControllerBase
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;

    public PaymentUserController(MyDBContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpPost("invoice/create")]
    public async Task<IActionResult> PayMent(PaymentRequestFullDto paymentRequestFull)
    {
        var reservation = await _context.Reservations.SingleOrDefaultAsync(
            a => a.Id == paymentRequestFull.ReservationId!
        );
        if (reservation is null)
        {
            return BadRequest(
                new StatusDto { StatusCode = 0, Message = "Reservation ID is not valid" }
            );
        }
        if (paymentRequestFull.Status != 1)
        {
            return BadRequest(new StatusDto { StatusCode = 0, Message = "Payment error" });
        }
        var reservationPayment = _mapper.Map<ReservationPayment>(paymentRequestFull);
        reservationPayment.CreateAt = DateTime.Now;
        await _context.ReservationPayments.AddAsync(reservationPayment);
        var email = User.Claims.FirstOrDefault(a => a.Type == ClaimTypes.Email)!.Value;
        var roles = User.Claims.Where(a => a.Type == ClaimTypes.Role).Select(a => a.Value).ToList();

        var creator = await _context.ApplicationUsers.SingleOrDefaultAsync(a => a.Email == email);
        InvoiceReservation invoice;

        invoice = new InvoiceReservation()
        {
            PayAt = DateTime.Now,
            PriceReservedRoom = reservation.ReservationPrice,
            PriceService = _context.OrderServices
                .Where(a => a.ReservationId == reservation.Id)
                .Sum(a => a.Price * a.Amount),
            ReservationId = reservation.Id,
            CreatorId = creator!.Id,
            SelfPay = false,
        };

        try
        {
            await _context.InvoiceReservations.AddAsync(invoice);
            await _context.SaveChangesAsync();
            return Ok(new StatusDto { StatusCode = 1, Message = "Payment successful" });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.InnerException!.Message);
        }
    }

    [AllowAnonymous]
    [HttpGet("invoice/get-all")]
    public async Task<IActionResult> GetAll()
    {
        var invoiceFulls = new List<InvoiceResponse>();
        var invoiceBases = await _context.InvoiceReservations
            .Include(a => a.Creator)
            .Include(a => a.Reservation)
            .Include(a => a.Reservation.ReservationPayment)
            .Include(a => a.Reservation.Room)
            .OrderByDescending(a => a.PayAt)
            .ToListAsync();
        if (invoiceBases is null)
        {
            return NotFound();
        }
        invoiceBases.ForEach(a =>
        {
            var temp = _mapper.Map<InvoiceResponse>(a);
            temp.Reservation = _mapper.Map<ReservationResponseInvoiceDto>(a.Reservation);
            temp.ReservationPayment = _mapper.Map<ReservationPaymentResponseInvoiceDto>(
                a.Reservation.ReservationPayment
            );
            temp.Room = _mapper.Map<RoomResponseDto>(a.Reservation.Room);
            invoiceFulls.Add(temp);
        });
        return Ok(invoiceFulls);
    }
}

public class InvoiceResponse
{
    public string Id { get; set; } = null!;

    public DateTime PayAt { get; set; }

    public decimal? PriceService { get; set; }

    public decimal PriceReservedRoom { get; set; }

    public bool? SelfPay { get; set; }

    public string Email { get; set; } = null!;

    public virtual ReservationResponseInvoiceDto Reservation { get; set; } = null!;

    public virtual ReservationPaymentResponseInvoiceDto ReservationPayment { get; set; } = null!;

    public virtual RoomResponseDto Room { get; set; } = null!;
}

public class ReservationResponseInvoiceDto
{
    public DateTime StartDate { get; set; }
    public float NumberOfDay { get; set; }
    public DateTime EndDate { get; set; }
    public decimal RoomPrice { get; set; }
    public decimal ReservationPrice { get; set; }
    public string RoomNumber { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public ReservationPaymentResponseInvoiceDto ReservationPayment { get; set; } = null!;
}

public class ReservationPaymentResponseInvoiceDto
{
    public string? OrderType { get; set; }
    public string? PayType { get; set; } = null!;
    public int Status { get; set; }
}
