namespace Database.Models;

public partial class ServiceRoom
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public decimal Price { get; set; }

    public int? Amount { get; set; }

    public string? Picture { get; set; }

    public decimal? PriceDiscount { get; set; }

    public virtual ICollection<DiscountServiceDetail> DiscountServiceDetails { get; } = new List<DiscountServiceDetail>();

    public virtual ICollection<OrderService> OrderServices { get; } = new List<OrderService>();
}
