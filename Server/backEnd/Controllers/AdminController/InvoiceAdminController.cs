using Database.Data;
using Database.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebHotel.DTO;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[ApiVersion("2.0")]
[Route("v{version:apiVersion}/admin/invoice/")]
[Authorize(Roles = "Admin")]
public class InvoiceAdminController : ControllerBase
{
    private readonly MyDBContext _context;

    public InvoiceAdminController(MyDBContext context)
    {
        _context = context;
    }

    //[HttpGet("get-all")]
    //public async Task<IActionResult> GetAll()
    //{
    //    var invoice = _context.InvoiceReservations.
    //}

    [HttpPost("create")]
    public async Task<IActionResult> Create(InvoiceCreateAdmin invoiceCreateAdmin)
    {
        var reservation = await _context.Reservations.SingleOrDefaultAsync(a => a.Id == invoiceCreateAdmin.ReservationId);
        if (reservation is not null)
        {

            reservation.Name = invoiceCreateAdmin.Name;
            reservation.Email = invoiceCreateAdmin.Email;
            reservation.PhoneNumber = invoiceCreateAdmin.Name;
            reservation.Address = invoiceCreateAdmin.Name;
            reservation.NumberOfPeople = invoiceCreateAdmin.NumberOfPeople;
            var reservationPayment = new ReservationPayment()
            {
                Message = "",
                OrderInfo = "",
                OrderType = "",
                PayType = "direct payment",
                PriceTotal = reservation!.ReservationPrice,
                ReservationId = reservation.Id,
                Status = 1
            };
            var invoice = new InvoiceReservation()
            {
                PriceService = 0,
                PriceReservedRoom = reservation.ReservationPrice,
                ReservationId = reservation.Id,
                SelfPay = true,
                CreatorId = reservation.UserId
            };
            try
            {
                await _context.AddRangeAsync(reservationPayment, invoice);
                await _context.SaveChangesAsync();
                return Ok(new StatusDto { StatusCode = 1, Message = "Create invoice successful" });
            }
            catch
            {
                return BadRequest(new StatusDto { StatusCode = 0, Message = "Please create reservation again" });
            }
        }
        else
        {
            return BadRequest(new StatusDto { StatusCode = 0, Message = "Please create reservation again, time out" });
        }
    }

    [HttpGet("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _context.InvoiceReservations.ToListAsync();
        if (result.Count == 0)
        {
            return NotFound();
        }
        return Ok(result);
    }
}
public class InvoiceCreateAdmin
{
    public string ReservationId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public int NumberOfPeople { get; set; }

    public string Email { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string? Address { get; set; }
}
