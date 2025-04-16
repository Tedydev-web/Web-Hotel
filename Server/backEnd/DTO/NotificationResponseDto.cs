namespace WebHotel.DTO
{
    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? CreateAt { get; set; }
        public bool? Status { get; set; }
        public string? Link { get; set; }
    }

    public class NotificationCreateDto
    {
        public enum NotificationTypeEnum
        {
            Room = 1,
            Reservation = 2,
            Invoice = 3,
            Discount = 4,
            User = 5
        }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Link { get; set; }
        public NotificationTypeEnum NotificationType { get; set; }
        public string UserId { get; set; } = null!;
    }

    public class NotificationResponseDtos
    {
        public int Count { get; set; }
        public List<NotificationResponseDto>? Items { get; set; }
    }
}
