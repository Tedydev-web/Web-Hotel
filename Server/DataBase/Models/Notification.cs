namespace Database.Models;

public class Notification
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? CreateAt { get; set; }
    public bool? Status { get; set; }
    public string? Link { get; set; }
    public int NotificationType { get; set; }
    public string UserId { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
}
