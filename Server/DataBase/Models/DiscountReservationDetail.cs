namespace Database.Models;

public partial class DiscountReservationDetail
{
    public int Id { get; set; }

    public string ReservationId { get; set; } = null!;

    public int DiscountId { get; set; }

    public string CreatorId { get; set; } = null!;

    public virtual ApplicationUser Creator { get; set; } = null!;

    public virtual Discount Discount { get; set; } = null!;

    public virtual Reservation Reservation { get; set; } = null!;
}
