using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.ReservationDtos
{
    public class ReservationCreateDto
    {
        [Required(ErrorMessage = "{0} is required")]
        public DateTime? StartDate { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public DateTime? EndDate { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public string? RoomId { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public float? NumberOfDay { get; set; }

        public int? NumberOfPeople { get; set; }

        public string? Name { get; set; }

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }
    }
}
