namespace DataBase.Models
{
    public partial class BlogType
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public virtual ICollection<BlogTypeDetail> BlogTypeDetails { get; } = new List<BlogTypeDetail>();
    }
}
