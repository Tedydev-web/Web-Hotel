namespace DataBase.Models;

public partial class Contact
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool Status { get; set; }
}
