namespace Database.Models;

public partial class Reservation
{
    public string Id { get; set; } = null!;

    public DateTime StartDate { get; set; }

    public float NumberOfDay { get; set; }

    public int? NumberOfPeople { get; set; }

    public DateTime EndDate { get; set; }

    public decimal RoomPrice { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public decimal ReservationPrice { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string? Address { get; set; }

    public string RoomId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public virtual ICollection<DiscountReservationDetail> DiscountReservationDetails { get; } = new List<DiscountReservationDetail>();


    public virtual ICollection<OrderService> OrderServices { get; } = new List<OrderService>();

    public virtual ICollection<ReservationChat> ReservationChats { get; } = new List<ReservationChat>();
    public virtual InvoiceReservation InvoiceReservation { get; set; } = null!;

    public virtual ReservationPayment ReservationPayment { get; set; } = null!;

    public virtual Room Room { get; set; } = null!;

    public virtual ApplicationUser User { get; set; } = null!;
}
