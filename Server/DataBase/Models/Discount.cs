namespace Database.Models;

public partial class Discount
{
    public int Id { get; set; }

    public string DiscountCode { get; set; } = null!;

    public string Name { get; set; } = null!;

    public decimal DiscountPercent { get; set; }

    public int AmountUse { get; set; }

    public DateTime StartAt { get; set; }

    public DateTime EndAt { get; set; }

    public bool? IsPermanent { get; set; }

    public bool? Active { get; set; }

    public int DiscountTypeId { get; set; }

    public string CreatorId { get; set; } = null!;

    public virtual ApplicationUser Creator { get; set; } = null!;

    public virtual ICollection<DiscountReservationDetail> DiscountReservationDetails { get; } = new List<DiscountReservationDetail>();

    public virtual ICollection<DiscountRoomDetail> DiscountRoomDetails { get; } = new List<DiscountRoomDetail>();

    public virtual ICollection<DiscountServiceDetail> DiscountServiceDetails { get; } = new List<DiscountServiceDetail>();

    public virtual DiscountType DiscountType { get; set; } = null!;
}
