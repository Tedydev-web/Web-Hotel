namespace WebHotel.DTO.DiscountDtos
{
    public class DiscountUpdateDto
    {
        public string Name { get; set; } = null!;

        public decimal DiscountPercent { get; set; }

        public int AmountUse { get; set; }

        public DateTime StartAt { get; set; }

        public DateTime EndAt { get; set; }

        public bool? IsPermanent { get; set; }

        public bool? Active { get; set; }

        public int DiscountTypeId { get; set; }
    }
}
