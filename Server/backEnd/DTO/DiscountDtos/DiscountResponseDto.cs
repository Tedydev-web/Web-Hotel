namespace WebHotel.DTO.DiscountDtos
{
    public class DiscountResponseDto
    {
        public int Id { get; set; }

        public string DiscountCode { get; set; } = null!;

        public string Name { get; set; } = null!;

        public decimal DiscountPercent { get; set; }

        public int AmountUse { get; set; }

        public DateTime StartAt { get; set; }

        public DateTime EndAt { get; set; }

        public bool? IsPermanent { get; set; }

        public int DiscountTypeId { get; set; }

        public string? NameType { get; set; }

        public string CreatorId { get; set; } = null!;

        public string? Email { get; set; }

        public List<string> Roles { get; set; } = new List<string>();
    }
}
