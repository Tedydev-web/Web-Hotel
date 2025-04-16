namespace Database.Models;

public partial class ReservationPayment
{
    public int Id { get; set; }

    public DateTime? CreateAt { get; set; }
    public decimal PriceTotal { get; set; }
    public string? OrderInfo { get; set; }
    public string? OrderType { get; set; }
    public string? PayType { get; set; } = null!;
    public int Status { get; set; }
    public string Message { get; set; } = null!;

    public string ReservationId { get; set; } = null!;

    public virtual Reservation Reservation { get; set; } = null!;
}
