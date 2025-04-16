namespace WebHotel.DTO.AccountDtos;

public class AccountResponseDto
{
    public string? Id { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public string? Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? CMND { get; set; }
    public string? Image { get; set; }
    public DateTime? CreatedAt { get; set; }
    public bool EmailConfirmed { get; set; }
    public string? PhoneNumber { get; set; }
    public bool LockoutEnabled { get; set; }
    public int AccessFailedCount { get; set; }
    public List<string> Roles { get; set; } = null!;
}
