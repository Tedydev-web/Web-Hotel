using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.RoomDtos
{
    public class RoomRequestDto
    {
        [Required(ErrorMessage = "{0} is required")]
        public string? RoomNumber { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public string? Name { get; set; }

        public bool? IsActive { get; set; }

        public string? Description { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public decimal? CurrentPrice { get; set; }

        public IFormFile? RoomPicture { get; set; }

        public List<IFormFile>? RoomPictures { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public string? PeopleNumber { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public int NumberOfSimpleBed { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public int NumberOfDoubleBed { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public int? RoomTypeId { get; set; }
    }
}
