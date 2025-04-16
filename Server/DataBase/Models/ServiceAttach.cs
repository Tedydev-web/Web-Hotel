namespace Database.Models;

public partial class ServiceAttach
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Icon { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<ServiceAttachDetail> ServiceAttachDetails { get; } = new List<ServiceAttachDetail>();
}
