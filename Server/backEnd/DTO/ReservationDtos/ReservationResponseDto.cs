using Database.Models;
using WebHotel.DTO.ReservationPayment;

public class ReservationResponseDto
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
    public ReservationPaymentResponseDto ReservationPayment { get; set; } = null!;
}