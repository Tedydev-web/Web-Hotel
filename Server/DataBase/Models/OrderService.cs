namespace Database.Models;

public partial class OrderService
{
    public int Id { get; set; }

    public string ServiceName { get; set; } = null!;

    public decimal Price { get; set; }

    public int Amount { get; set; }

    public int ServiceRoomId { get; set; }

    public string UserId { get; set; } = null!;

    public string ReservationId { get; set; } = null!;

    public virtual Reservation Reservation { get; set; } = null!;

    public virtual ServiceRoom ServiceRoom { get; set; } = null!;

    public virtual ApplicationUser User { get; set; } = null!;
}
