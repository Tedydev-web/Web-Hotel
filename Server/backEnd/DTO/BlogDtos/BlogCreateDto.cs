using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.BlogDtos;

public class BlogCreateDto
{
    [Required(ErrorMessage = "{0} is required")]
    public string? ShortTitle { get; set; }

    [Required(ErrorMessage = "{0} is required")]
    public string? ShortContent { get; set; }

    [Required(ErrorMessage = "{0} is required")]
    public IFormFile? Image { get; set; }

    [Required(ErrorMessage = "{0} is required")]
    public string? LongTitle { get; set; }

    [Required(ErrorMessage = "{0} is required")]
    public string? LongContent { get; set; }
}
