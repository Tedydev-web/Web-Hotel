namespace Database.Models;

public partial class ReservationChat
{
    public int Id { get; set; }

    public string SendUsername { get; set; } = null!;

    public string ReceiveUsername { get; set; } = null!;

    public string? Message { get; set; }

    public DateTime SendAt { get; set; }

    public int IdFather { get; set; }

    public string ReservationId { get; set; } = null!;

    public virtual Reservation Reservation { get; set; } = null!;
}
