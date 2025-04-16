namespace Database.Models;

public partial class InvoiceReservation
{
    public string Id { get; set; } = null!;

    public DateTime PayAt { get; set; }

    public decimal? PriceService { get; set; }

    public decimal PriceReservedRoom { get; set; }

    public bool? SelfPay { get; set; }

    public string ReservationId { get; set; } = null!;

    public string CreatorId { get; set; } = null!;

    public virtual ApplicationUser Creator { get; set; } = null!;

    public virtual Reservation Reservation { get; set; } = null!;
}
