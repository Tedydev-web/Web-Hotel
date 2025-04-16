using Database.Models;
using DataBase.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Database.Data;

public partial class MyDBContext : IdentityDbContext<ApplicationUser, ApplicationRole, string,
        ApplicationUserClaim, ApplicationUserRole, ApplicationUserLogin,
        ApplicationRoleClaim, ApplicationUserToken>
{
#pragma warning disable CS8618
    public MyDBContext(DbContextOptions<MyDBContext> options) : base(options)
    {

    }

    public virtual DbSet<ApplicationUser> ApplicationUsers { get; set; }

    public virtual DbSet<ApplicationRole> ApplicationRoles { get; set; }

    public virtual DbSet<ApplicationRoleClaim> ApplicationRoleClaims { get; set; }

    public virtual DbSet<ApplicationUserLogin> ApplicationUserLogins { get; set; }

    public virtual DbSet<ApplicationUserToken> ApplicationUserTokens { get; set; }

    public virtual DbSet<ApplicationUserClaim> ApplicationUserClaims { get; set; }

    public virtual DbSet<ApplicationUserRole> ApplicationUserRoles { get; set; }

    public virtual DbSet<Discount> Discounts { get; set; }

    public virtual DbSet<DiscountReservationDetail> DiscountReservationDetails { get; set; }

    public virtual DbSet<DiscountRoomDetail> DiscountRoomDetails { get; set; }

    public virtual DbSet<DiscountServiceDetail> DiscountServiceDetails { get; set; }

    public virtual DbSet<DiscountType> DiscountTypes { get; set; }

    public virtual DbSet<InvoiceReservation> InvoiceReservations { get; set; }

    public virtual DbSet<OrderService> OrderServices { get; set; }

    public virtual DbSet<Reservation> Reservations { get; set; }

    public virtual DbSet<ReservationChat> ReservationChats { get; set; }

    public virtual DbSet<ReservationPayment> ReservationPayments { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

    public virtual DbSet<RoomStar> RoomStarts { get; set; }

    public virtual DbSet<RoomType> RoomTypes { get; set; }

    public virtual DbSet<ServiceAttach> ServiceAttaches { get; set; }

    public virtual DbSet<ServiceAttachDetail> ServiceAttachDetails { get; set; }

    public virtual DbSet<ServiceRoom> ServiceRooms { get; set; }

    public virtual DbSet<TokenInfo> TokenInfos { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Blog> Blogs { get; set; }

    public virtual DbSet<BlogType> BlogTypes { get; set; }

    public virtual DbSet<BlogTypeDetail> BlogTypeDetails { get; set; }

    public virtual DbSet<Contact> Contacts { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Image).HasMaxLength(450);
            entity.Property(e => e.CreatedAt).IsRowVersion().IsConcurrencyToken().HasDefaultValueSql("GetDate()");
            entity.Property(e => e.Name).IsRequired(false);
            // Each User can have many UserClaims
            entity.HasMany(e => e.Claims)
                .WithOne(e => e.User)
                .HasForeignKey(uc => uc.UserId)
                .IsRequired();

            // Each User can have many UserLogins
            entity.HasMany(e => e.Logins)
                .WithOne(e => e.User)
                .HasForeignKey(ul => ul.UserId)
                .IsRequired();

            // Each User can have many UserTokens
            entity.HasMany(e => e.Tokens)
                .WithOne(e => e.User)
                .HasForeignKey(ut => ut.UserId)
                .IsRequired();

            // Each User can have many entries in the UserRole join table
            entity.HasMany(e => e.UserRoles)
                .WithOne(e => e.User)
                .HasForeignKey(ur => ur.UserId)
                .IsRequired();
        });

        modelBuilder.Entity<ApplicationRole>(b =>
        {
            // Each Role can have many entries in the UserRole join table
            b.HasMany(e => e.UserRoles)
                .WithOne(e => e.Role)
                .HasForeignKey(ur => ur.RoleId)
                .IsRequired();

            // Each Role can have many associated RoleClaims
            b.HasMany(e => e.RoleClaims)
                .WithOne(e => e.Role)
                .HasForeignKey(rc => rc.RoleId)
                .IsRequired();
        });
        modelBuilder.Entity<Discount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Discount__3214EC078ED86676");

            entity.ToTable("Discount");

            entity.HasIndex(e => e.DiscountCode, "Discount_DiscountCode").IsUnique();

            entity.Property(e => e.CreatorId).HasMaxLength(450);
            entity.Property(e => e.DiscountCode).HasMaxLength(255);
            entity.Property(e => e.DiscountPercent).HasColumnType("decimal(19, 2)").HasDefaultValueSql("0");
            entity.Property(e => e.EndAt).HasColumnType("datetime");
            entity.Property(e => e.IsPermanent).HasDefaultValueSql("((0))");
            entity.Property(e => e.Active).HasDefaultValueSql("((1))");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.StartAt).HasColumnType("datetime").HasDefaultValueSql("getdate()");

            entity.HasOne(d => d.Creator).WithMany(p => p.Discounts)
                .HasForeignKey(d => d.CreatorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Discount_AspNetUsers");

            entity.HasOne(d => d.DiscountType).WithMany(p => p.Discounts)
                .HasForeignKey(d => d.DiscountTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Discount_DiscountType");
        });

        modelBuilder.Entity<DiscountReservationDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Discount__3214EC076173384A");

            entity.ToTable("DiscountReservationDetail");

            entity.Property(e => e.CreatorId).HasMaxLength(450);
            entity.Property(e => e.ReservationId).HasMaxLength(255);

            entity.HasOne(d => d.Creator).WithMany(p => p.DiscountReservationDetails)
                .HasForeignKey(d => d.CreatorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountReservationDetail_AspNetUsers");

            entity.HasOne(d => d.Discount).WithMany(p => p.DiscountReservationDetails)
                .HasForeignKey(d => d.DiscountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountReservationDetail_Discount");

            entity.HasOne(d => d.Reservation).WithMany(p => p.DiscountReservationDetails)
                .HasForeignKey(d => d.ReservationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountReservationDetai_Reservation");
        });

        modelBuilder.Entity<DiscountRoomDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Discount__3214EC0780B8A9E7");

            entity.ToTable("DiscountRoomDetail");

            entity.Property(e => e.CreatorId).HasMaxLength(450);
            entity.Property(e => e.RoomId).HasMaxLength(255);

            entity.HasOne(d => d.Creator).WithMany(p => p.DiscountRoomDetails)
                .HasForeignKey(d => d.CreatorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountRoomDetail_AspNetUsers");

            entity.HasOne(d => d.Discount).WithMany(p => p.DiscountRoomDetails)
                .HasForeignKey(d => d.DiscountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountRoomDetail_Discount");

            entity.HasOne(d => d.Room).WithMany(p => p.DiscountRoomDetails)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountRoomDetail_Room");
        });

        modelBuilder.Entity<DiscountServiceDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Discount__3214EC07F7AD559D");

            entity.ToTable("DiscountServiceDetail");

            entity.Property(e => e.CreatorId).HasMaxLength(450);

            entity.HasOne(d => d.Creator).WithMany(p => p.DiscountServiceDetails)
                .HasForeignKey(d => d.CreatorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountService_AspNetUsers");

            entity.HasOne(d => d.Discount).WithMany(p => p.DiscountServiceDetails)
                .HasForeignKey(d => d.DiscountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountServiceDetail_Discount");

            entity.HasOne(d => d.Service).WithMany(p => p.DiscountServiceDetails)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DiscountServiceDetail_ServiceRoom");
        });

        modelBuilder.Entity<DiscountType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Discount__3214EC070D2B3684");

            entity.ToTable("DiscountType");

            entity.HasIndex(e => e.Name, "DiscountType_Name").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<InvoiceReservation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__InvoiceR__3214EC07A70F1055");

            entity.ToTable("InvoiceReservation");

            entity.Property(e => e.Id)
            .HasMaxLength(255)
            .HasDefaultValueSql("(newid())");

            entity.Property(e => e.PayAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.Property(e => e.SelfPay).HasDefaultValueSql("1");
            entity.Property(e => e.PriceReservedRoom).HasColumnType("decimal(19, 2)");
            entity.Property(e => e.PriceService)
                .HasDefaultValueSql("((0))")
                .HasColumnType("decimal(19, 2)");

            entity.HasOne(d => d.Reservation).WithOne(p => p.InvoiceReservation)
                .HasForeignKey<InvoiceReservation>(d => d.ReservationId).IsRequired();

            entity.HasOne(d => d.Creator).WithMany(p => p.InvoiceReservations)
                .HasForeignKey(d => d.CreatorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_InvoiceReservation_ApplicationUser");
        });

        modelBuilder.Entity<OrderService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__OrderSer__3214EC07E6ACBE95");

            entity.ToTable("OrderService");

            entity.Property(e => e.Price).HasColumnType("decimal(19, 2)");
            entity.Property(e => e.ReservationId).HasMaxLength(255);
            entity.Property(e => e.ServiceName).HasMaxLength(255);
            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.Reservation).WithMany(p => p.OrderServices)
                .HasForeignKey(d => d.ReservationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderService_Reservation");

            entity.HasOne(d => d.ServiceRoom).WithMany(p => p.OrderServices)
                .HasForeignKey(d => d.ServiceRoomId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderService_ServiceRoom");

            entity.HasOne(d => d.User).WithMany(p => p.OrderServices)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderService_AspNetUsers");
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Reservat__3214EC075152009A");

            entity.ToTable("Reservation");

            entity.Property(e => e.Id)
                .HasMaxLength(255)
                .HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("getdate()");

            entity.Property(e => e.NumberOfDay).HasDefaultValueSql("1.0");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.ReservationPrice).HasColumnType("decimal(19, 2)");
            entity.Property(e => e.RoomId).HasMaxLength(255);
            entity.Property(e => e.RoomPrice).HasColumnType("decimal(19, 2)");
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.Room).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reservation_Room");

            entity.HasOne(d => d.User).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Reservation_AspNetUsers");
        });

        modelBuilder.Entity<ReservationChat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Reservat__3214EC073328611D");

            entity.ToTable("ReservationChat");

            entity.Property(e => e.Message).HasColumnType("ntext");
            entity.Property(e => e.ReceiveUsername).HasMaxLength(255);
            entity.Property(e => e.ReservationId).HasMaxLength(255);
            entity.Property(e => e.SendAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.SendUsername).HasMaxLength(255);

            entity.HasOne(d => d.Reservation).WithMany(p => p.ReservationChats)
                .HasForeignKey(d => d.ReservationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ReservationChat_Reservation");
        });

        modelBuilder.Entity<ReservationPayment>(entity =>
        {
            entity.ToTable("ReservationPayment");
            entity.HasKey(e => e.Id).HasName("PK__Reservat__3214EC07950B4BF3");

            entity.Property(e => e.CreateAt).HasColumnType("datetime").HasDefaultValueSql("getDate()");
            entity.Property(e => e.PriceTotal).HasDefaultValueSql("0").HasColumnType("decimal(19,2)");
            entity.Property(e => e.Status).HasDefaultValueSql("1");
            entity.Property(e => e.ReservationId).HasMaxLength(255);

            entity.HasOne(d => d.Reservation).WithOne(p => p.ReservationPayment)
                .HasForeignKey<ReservationPayment>(d => d.ReservationId)
                .IsRequired();
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Room__3214EC078410FF00");

            entity.ToTable("Room");

            entity.HasIndex(e => e.Name, "Room_Name").IsUnique();

            entity.HasIndex(e => e.RoomNumber, "Room_RoomNumber").IsUnique();

            entity.Property(e => e.Id)
                .HasMaxLength(255)
                .HasDefaultValueSql("(newid())");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .ValueGeneratedOnAddOrUpdate();

            entity.Property(e => e.CurrentPrice).HasColumnType("decimal(12, 2)");

            entity.Property(e => e.Description).HasColumnType("ntext");

            entity.Property(e => e.DiscountPrice).HasColumnType("decimal(19, 2)").HasDefaultValueSql("0");

            entity.Property(e => e.PeopleNumber).HasDefaultValueSql("((1))");

            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValueSql("('true')");

            entity.Property(e => e.Name).HasMaxLength(255);

            entity.Property(e => e.RoomNumber)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.Property(e => e.RoomPicture)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.Property(e => e.StarAmount).HasDefaultValueSql("((0))");

            entity.Property(e => e.StarSum).HasDefaultValueSql("((0))");

            entity.Property(e => e.StarValue).HasDefaultValueSql("((0))");

            entity.HasOne(d => d.RoomType).WithMany(p => p.Rooms)
                .HasForeignKey(d => d.RoomTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Room_RoomType");
        });

        modelBuilder.Entity<RoomStar>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RoomStar__3214EC0789A3F679");

            entity.ToTable("RoomStar");

            entity.Property(e => e.RoomId).HasMaxLength(255);

            entity.HasOne(d => d.Room).WithMany(p => p.RoomStars)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RoomStar_Room");
        });

        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RoomType__3214EC078A6FFBFF");

            entity.ToTable("RoomType");

            entity.HasIndex(e => e.TypeName, "RoomType_TypeName").IsUnique();

            entity.Property(e => e.TypeName).HasMaxLength(255);
        });

        modelBuilder.Entity<ServiceAttach>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ServiceA__3214EC07B90411A4");

            entity.ToTable("ServiceAttach");

            entity.HasIndex(e => e.Name, "ServiceAttach_Name").IsUnique();

            entity.Property(e => e.Description).HasColumnType("ntext");
            entity.Property(e => e.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<ServiceAttachDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ServiceA__3214EC0770EA377F");

            entity.ToTable("ServiceAttachDetail");

            entity.HasIndex(c => new { c.ServiceAttachId, c.RoomTypeId }).IsUnique(true);

            entity.HasOne(d => d.RoomType).WithMany(p => p.ServiceAttachDetails)
                .HasForeignKey(d => d.RoomTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ServiceAttachDetail_RoomType");

            entity.HasOne(d => d.ServiceAttach).WithMany(p => p.ServiceAttachDetails)
                .HasForeignKey(d => d.ServiceAttachId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ServiceAttachDetail_ServiceAttach");
        });

        modelBuilder.Entity<ServiceRoom>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ServiceR__3214EC077BECCD82");

            entity.ToTable("ServiceRoom");

            entity.HasIndex(e => e.Name, "ServiceRoom_Name").IsUnique();

            entity.Property(e => e.Amount).HasDefaultValueSql("((0))");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Picture).HasColumnType("ntext");
            entity.Property(e => e.Price).HasColumnType("decimal(19, 2)").HasDefaultValueSql("0");
            entity.Property(e => e.PriceDiscount).HasColumnType("decimal(19, 2)").HasDefaultValueSql("0");
        });

        modelBuilder.Entity<TokenInfo>(entity =>
        {
            entity.ToTable("TokenInfo");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notification");
            entity.HasKey(e => e.Id).HasName("PK_Notification");

            entity.Property(e => e.CreateAt).HasColumnType("datetime").HasDefaultValueSql("(getdate())");

            entity.Property(e => e.NotificationType).HasDefaultValueSql("0");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notification_AspNetUsers");

            entity.Property(e => e.Status).HasDefaultValueSql("1");
        });

        modelBuilder.Entity<Blog>(entity =>
        {
            entity.ToTable("Blog");
            entity.HasKey(e => e.Id).HasName("PK_Blog");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Poster).WithMany(p => p.Blogs)
                .HasForeignKey(d => d.PosterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Blog_AspNetUsers");
        });

        modelBuilder.Entity<BlogType>(entity =>
        {
            entity.ToTable("BlogType");
            entity.HasKey(e => e.Id).HasName("PK_BlogType");
        });

        modelBuilder.Entity<BlogTypeDetail>(entity =>
        {
            entity.ToTable("BlogTypeDetail");
            entity.HasKey(e => e.Id).HasName("PK_BlogTypeDetail");

            entity.HasOne(d => d.BlogType).WithMany(p => p.BlogTypeDetails)
                .HasForeignKey(d => d.BlogTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BlogTypeDetail_BlogType");

            entity.HasOne(d => d.Blog).WithMany(p => p.BlogTypeDetails)
                .HasForeignKey(d => d.BlogTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BlogTypeDetail_Blog");
        });

        modelBuilder.Entity<Contact>(e =>
        {
            e.HasKey(a => a.Id);
            e.ToTable("Contact");
            e.Property(a => a.Phone).HasMaxLength(20);
            e.Property(a => a.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("getDate()");

        });

        OnModelCreatingPartial(modelBuilder);
    }
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
