namespace DataBase.Models
{
    public partial class BlogTypeDetail
    {
        public int Id { get; set; }
        public int BlogTypeId { get; set; }
        public int BlogId { get; set; }
        public BlogType BlogType { get; set; } = null!;
        public Blog Blog { get; set; } = null!;
    }
}
