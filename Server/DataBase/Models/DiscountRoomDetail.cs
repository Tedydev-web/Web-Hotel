namespace Database.Models;

public partial class DiscountRoomDetail
{
    public int Id { get; set; }

    public string RoomId { get; set; } = null!;

    public int DiscountId { get; set; }

    public string CreatorId { get; set; } = null!;

    public virtual ApplicationUser Creator { get; set; } = null!;

    public virtual Discount Discount { get; set; } = null!;

    public virtual Room Room { get; set; } = null!;
}
