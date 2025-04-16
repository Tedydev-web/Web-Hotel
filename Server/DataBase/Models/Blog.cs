using Database.Models;

namespace DataBase.Models
{
    public partial class Blog
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ShortTitle { get; set; } = null!;
        public string ShortContent { get; set; } = null!;
        public string Image { get; set; } = null!;
        public string LongTitle { get; set; } = null!;
        public string LongContent { get; set; } = null!;
        public string PosterId { get; set; } = null!;
        public virtual ApplicationUser Poster { get; set; } = null!;
        public virtual ICollection<BlogTypeDetail> BlogTypeDetails { get; } = new List<BlogTypeDetail>();
    }
}
