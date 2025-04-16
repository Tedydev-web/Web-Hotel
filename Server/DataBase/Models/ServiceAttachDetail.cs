namespace Database.Models;

public partial class ServiceAttachDetail
{
    public int Id { get; set; }

    public int RoomTypeId { get; set; }

    public int ServiceAttachId { get; set; }

    public virtual RoomType RoomType { get; set; } = null!;

    public virtual ServiceAttach ServiceAttach { get; set; } = null!;
}
