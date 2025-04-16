namespace WebHotel.DTO.RoomDtos
{
    public class RoomDataSearchDto
    {
        public DateTime? checkIn { get; set; }
        public DateTime? checkOut { get; set; }
        public decimal? price { get; set; }
        public int? typeRoomId { get; set; }
        public float? star { get; set; }
        public int? peopleNumber { get; set; }
    }
}
