namespace Database.Models;

public partial class DiscountServiceDetail
{
    public int Id { get; set; }

    public int ServiceId { get; set; }

    public int DiscountId { get; set; }

    public string CreatorId { get; set; } = null!;

    public virtual ApplicationUser Creator { get; set; } = null!;

    public virtual Discount Discount { get; set; } = null!;

    public virtual ServiceRoom Service { get; set; } = null!;
}
